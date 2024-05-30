import React, { useEffect, useRef, useState } from "react";
import type { IpcRendererEvent } from "../../electron/preload";
import "../Styles/TaskList.css";
import { Task } from "../Data/Interfaces/taskTypes";
import delImg from "../Assets/Trash.png";
import editImg from "../Assets/edit.png";
import { useAuth } from "../AuthContext/index";
import { useTranslation } from "react-i18next";
import i18n from "@/Data/i18n";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function TaskList() {
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [taskList, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("taskListPnd");
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: undefined,
            TaskName: "Loading tasks...",
            TaskDesc: "",
            TaskDueDate: new Date(0),
            TaskClass: "",
            TaskStatus: false,
            TaskDiff: 0,
            TaskUser: { uid: "", displayName: null, email: null },
            TaskDate: "",
            TaskOrder: 0,
          },
        ];
  });

  const [tasksToDelete, setTasksToDelete] = useState<string[]>([]);
  const [getTasks, setGetTasks] = useState(false);
  const [showDetail, setShowDetail] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState("pending");
  const [getXp, setGetXp] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("taskListPnd");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    setGetTasks(true);
  }, []);

  useEffect(() => {
    setGetXp(true);
  }, []);

  useEffect(() => {
    const handleShowTasks = (event: IpcRendererEvent, tasks: Task[]) => {
      if (1 > 2) {
        console.log(event);
        console.log(getXp);
        console.log(taskList, setTasks);
      }
      setCompletedTasks(tasks.filter((task) => task.TaskStatus === true));
      console.log(tasks);
      setPendingTasks(
        tasks
          .filter((task) => task.TaskStatus === false)
          .sort((a, b) => a.TaskDate - b.TaskDate)
      );

      localStorage.setItem("taskListPnd", JSON.stringify(pendingTasks));
      setGetTasks(false);
    };

    if (getTasks) {
      ipcRenderer.send("getTasks", currentUser?.uid);
    }

    ipcRenderer.on("showTasks", handleShowTasks);

    return () => {
      ipcRenderer.removeAllListeners("showTasks", handleShowTasks);
    };
  }, [getTasks]);

  const handleDeleteBtnClick = () => {
    if (tasksToDelete.length > 0) {
      ipcRenderer.send("deleteTask", tasksToDelete, currentUser?.uid);
    }
  };

  const formatDate = (date: any): string => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  
    if (date instanceof Date) {
      return `${date.toLocaleDateString("es-ES")} ${date.toLocaleTimeString("es-ES", options)}`;
    } else if (date && date.seconds && typeof date.seconds === 'number') {
      const milliseconds = date.seconds * 1000 + Math.round(date.nanoseconds / 1000000);
      const dateObject = new Date(milliseconds);
      return `${dateObject.toLocaleDateString("es-ES")} ${dateObject.toLocaleTimeString("es-ES", options)}`;
    } else {
      return "";
    }
  };
  
  

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("taskList");
      if (container) {
        const windowHeight = window.innerHeight;
        let minHeight, maxHeight;

        if (window.screen.availHeight < 768) {
          minHeight = windowHeight / 3;
          maxHeight = windowHeight / 3;
        } else {
          minHeight = windowHeight * 0.15;
          maxHeight = windowHeight * 0.6;
        }

        const containerHeight =
          minHeight + (maxHeight - minHeight) * (windowHeight / screen.height);
        container.style.height = containerHeight + "px";
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCheckDeleteChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    task: Task
  ) => {
    const taskId = task.id || 0;
    if (event.target.checked) {
      await setTasksToDelete([...tasksToDelete, taskId]);
    } else {
      await setTasksToDelete(tasksToDelete.filter((id) => id !== taskId));
    }
  };

  const handleEditBtnClick = async (task: Task) => {
    try {
      await ipcRenderer.send("editTask", task.id, currentUser?.uid);
    } catch (error) {
      console.error("Error sending edit request:", error);
    }
  };

  const handleCompleteBtnClick = async (task: Task) => {
    try {
      await ipcRenderer.send("changeStatusTask", task.id, currentUser?.uid);

      const updatedTasksPnd = pendingTasks;
      const updatedTasksCnf = completedTasks;
      task.TaskStatus = !task.TaskStatus;
      if (!task.TaskStatus) {
        updatedTasksPnd.push(task);
        setPendingTasks(updatedTasksPnd);
        setCompletedTasks(updatedTasksCnf.filter((t) => t.id !== task.id));
      } else {
        updatedTasksCnf.push(task);
        setCompletedTasks(updatedTasksCnf);
        setPendingTasks(updatedTasksPnd.filter((t) => t.id !== task.id));
      }
    } catch (error) {
      console.error("Error sending edit request:", error);
    }
  };

  const handleEditTask = async (event: IpcRendererEvent) => {
    setGetTasks(true);
    if (1 > 2) {
      console.log(event);
    }
  };

  useEffect(() => {
    ipcRenderer.on("taskAdded", handleEditTask);
    return () => {
      ipcRenderer.removeAllListeners("taskAdded");
    };
  }, []);

  const handleLang = async (event: IpcRendererEvent, lang: string) => {
    i18n.changeLanguage(lang);
    if (1 > 2) {
      console.log(event);
    }
  };

  useEffect(() => {
    ipcRenderer.on("changeLang", handleLang);

    return () => {
      ipcRenderer.removeAllListeners("changeLang");
    };
  }, []);

  const [xpGained, setXpGained] = useState(0);
  const expAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleXPChange = (event: IpcRendererEvent, newXpGained: number) => {
      if (1 > 2) {
        console.log(event);
      }
      if (typeof newXpGained === "number") {
        setXpGained(newXpGained);
        setGetXp(false);
      } else {
        console.error("Received invalid XP value:", newXpGained);
      }
    };
    ipcRenderer.on("changeXP", handleXPChange);
    const expAlertElement = document.getElementById("expAlert");
    if (expAlertElement && expAlertRef.current) {
      expAlertRef.current.textContent = `+${xpGained}xp`;
    }
    return () => {
      ipcRenderer.removeAllListeners("changeXP", handleXPChange);
    };
  }, []);
  const getTaskDifficultyLabel = (difficulty: number): string => {
    if (difficulty >= 1 && difficulty <= 4) {
      return t("easy");
    } else if (difficulty >= 5 && difficulty <= 7) {
      return t("medium");
    } else if (difficulty >= 8 && difficulty <= 10) {
      return t("hard");
    } else {
      return "Unknown"; 
    }
  };
  useEffect(() => {
    const handleDeleteTaskSuccess = (
      event: IpcRendererEvent,
      deletedIds: string[]
    ) => {
      clearDeletedTaskIds(deletedIds);
      const updatedTaskList = pendingTasks.filter(
        (task) => !deletedIds.includes(task.id || 0)
      );
      if (1 > 2) {
        console.log(event);
      }
      setPendingTasks(updatedTaskList);

      setTasksToDelete([]);
    };

    ipcRenderer.on("deleteTaskSuccess", handleDeleteTaskSuccess);

    return () => {
      ipcRenderer.removeAllListeners(
        "deleteTaskSuccess",
        handleDeleteTaskSuccess
      );
    };
  }, [pendingTasks]);

  const clearDeletedTaskIds = (deletedIds: string[]) => {
    const savedTasks = localStorage.getItem("taskListPnd");
    if (savedTasks) {
      let updatedTasks = JSON.parse(savedTasks);
      updatedTasks = updatedTasks.filter((task: Task) => {
        return !deletedIds.some((deletedId) => deletedId === task.id);
      });
      localStorage.setItem("taskListPnd", JSON.stringify(updatedTasks));
    }
  };

  const syncTasks = async () => {
    const tasksToSave = localStorage.getItem("taskListPnd");
    if (!tasksToSave) {
      return;
    }
    try {
      await ipcRenderer.send(
        "SyncTasks",
        JSON.parse(tasksToSave),
        currentUser?.uid
      );
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const updatedTasks = [...pendingTasks];
    const [reorderedTask] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, reorderedTask);
    updatedTasks.forEach((task, index) => {
      task.TaskOrder = index;
    });
    setPendingTasks(updatedTasks);
    localStorage.setItem("taskListPnd", JSON.stringify(updatedTasks));
    syncTasks();
  };
  const handleDetailClick = (taskId: string) => {
    setShowDetail((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };

  return (
    <div>
      <div
        id="taskList"
        className="w-full items-center mx-auto space-y-2 max-w-lg"
      >
        <div className="tabsCont">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              <a>{t("pendings")}</a>
            </button>
            <button
              className={`tab ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              <a>{t("completed")}</a>
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeTab === "pending" &&
                  pendingTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id!.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="taskContainer"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="taskImgCont">
                            <label className="imgBtn">
                              <input
                                type="checkbox"
                                className="checkFinish"
                                onClick={() => handleCompleteBtnClick(task)}
                              />
                              <div className="taskImage"></div>
                            </label>
                          </div>
                          <div className="taskContent">
                            <span className="taskNameCont group hover:group" onClick={() => handleDetailClick(task.id || `task-${index}`)}>
                              <h1 className="taskName">{task.TaskName}</h1>
                              <h3 className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                +{7 * task.TaskDiff} xp
                              </h3>
                            </span>
                            <div
                              className={`TaskDetail`}
                            >{showDetail[task.id || `task-${index}`] && (
                              <>
                              <div className="taskDet1">
                                {task.TaskClass && (
                                  <p>{t(task.TaskClass)}</p>
                                )}
                                {task.TaskDiff && ( 
                                  <p>
                                    {`${getTaskDifficultyLabel(task.TaskDiff)}`}
                                  </p>
                                )}
                                {task.TaskDueDate && (<span className="taskDate">{formatDate(task.TaskDueDate)}</span> )}
                              </div>
                              {task.TaskDesc !== '' && (
                                <div className="taskDet2">
                                <h3>{task.TaskDesc}</h3>
                              </div>
                              )}
                              </>
                            )}
                              
                            </div>

                          </div>
                          <div className="taskControls">
                            <div className="taskCheckCont">
                              <img
                                src={editImg}
                                className="imgBtn editBtn"
                                onClick={() => handleEditBtnClick(task)}
                              />
                            </div>
                            <div className="taskCheckCont">
                              <label className="imgBtn">
                                <input
                                  type="checkbox"
                                  className="checkDelete"
                                  onChange={(event) =>
                                    handleCheckDeleteChange(event, task)
                                  }
                                />
                                <div className="taskCheck"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {activeTab === "completed" &&
          completedTasks.map((task, index) => (
            <div className="taskContainerFinished" key={index}>
              <div className="taskImgCont">
                <label className="imgBtn">
                  <input
                    type="checkbox"
                    className="checkFinished"
                    onClick={() => handleCompleteBtnClick(task)}
                  />
                  <div className="taskImage"></div>
                </label>
              </div>
              <div className="taskContent">
                <h1 className="taskName">{task.TaskName}</h1>
                <div className="taskDet2">
                  <h3>{task.TaskDesc}</h3>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="w-full flex justify-end items-center mx-auto space-y-2 max-w-lg">
        <div className="DeleteBtn">
          <img
            src={delImg}
            className={tasksToDelete.length > 0 ? "DeleteOn" : "DeleteOff"}
            onClick={handleDeleteBtnClick}
          />
        </div>
      </div>
    </div>
  );
}

export default TaskList;
