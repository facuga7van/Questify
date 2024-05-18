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
    const savedTasks = localStorage.getItem("taskList");
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
  const [activeTab, setActiveTab] = useState("pending");
  const [getXp, setGetXp] = useState(false);

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
      }
      setGetTasks(false);
      const sortedTasks = tasks.sort((a, b) => a.TaskOrder - b.TaskOrder);
      setTasks(sortedTasks);
      localStorage.setItem("taskList", JSON.stringify(sortedTasks));
    };
    if (getTasks) {
      ipcRenderer.send("getTasks", currentUser?.uid);
    }
    ipcRenderer.on("showTasks", handleShowTasks);

    return () => {
      ipcRenderer.removeAllListeners("showTasks", handleShowTasks);
    };
  }, [getTasks]);

  useEffect(() => {
    const syncTasks = async () => {
      if (currentUser) {
        const currentTasks = [...taskList]; // Guarda el estado actual de taskList
        return new Promise<void>((resolve) => {
          ipcRenderer.send("syncTasks", currentTasks, currentUser.uid); // Usa el estado actualizado de taskList
          const successListener = () => {
            ipcRenderer.removeAllListeners("syncTasksSuccess");
            resolve();
          };

          ipcRenderer.on("syncTasksSuccess", successListener);
        });
      }
    };

    const intervalId = setInterval(syncTasks, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [taskList, currentUser]);

  const handleDeleteBtnClick = () => {
    if (tasksToDelete.length > 0) {
      ipcRenderer.send("deleteTask", tasksToDelete, currentUser?.uid);
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
      await setTasksToDelete(tasksToDelete.filter((id) => id !== task.id));
      await ipcRenderer.send("changeStatusTask", task.id, currentUser?.uid);
    } catch (error) {
      console.error("Error sending edit request:", error);
    }
  };

  const handleEditTask = (event: IpcRendererEvent) => {
    setGetTasks(true);
    if (1 > 2) {
      console.log(event);
    }
  };

  const handleLang = (event: IpcRendererEvent, lang: string) => {
    i18n.changeLanguage(lang);
    if (1 > 2) {
      console.log(event);
    }
  };

  useEffect(() => {
    ipcRenderer.on("taskAdded", handleEditTask);
    ipcRenderer.on("changeLang", handleLang);
  }, []);

  const [xpGained, setXpGained] = useState(0);
  const expAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleXPChange = (event: IpcRendererEvent, newXpGained: number) => {
      if (newXpGained > 0) {
        setXpGained(newXpGained);
        setGetXp(false);
        if (1 > 2) {
          console.log(event);
        }
      } else {
        setXpGained(0);
        setGetXp(false);
      }
      ipcRenderer.removeAllListeners("changeXP", handleXPChange);
    };

    ipcRenderer.on("changeXP", handleXPChange);

    const expAlertElement = document.getElementById("expAlert");
    if (expAlertElement && expAlertRef.current) {
      expAlertRef.current.textContent = `+${xpGained}xp`;
    }
  }, [xpGained]);

  useEffect(() => {
    const handleDeleteTaskSuccess = (
      event: IpcRendererEvent,
      deletedIds: string[]
    ) => {
      console.log(deletedIds)
      clearDeletedTaskIds(deletedIds);
      const updatedTaskList = taskList.filter(
        (task) => !deletedIds.includes(task.id || 0)
      );
      if (1 > 2) {
        console.log(event);
      }
      setTasks(updatedTaskList);
      
      setTasksToDelete([]);
    };

    ipcRenderer.on("deleteTaskSuccess", handleDeleteTaskSuccess);

    return () => {
      ipcRenderer.removeAllListeners(
        "deleteTaskSuccess",
        handleDeleteTaskSuccess
      );
    };
  }, [taskList]);

  const clearDeletedTaskIds = (deletedIds: string[]) => {
    const savedTasks = localStorage.getItem("taskList");
    console.log(savedTasks)
    if (savedTasks) {
      let updatedTasks = JSON.parse(savedTasks);
      updatedTasks = updatedTasks.filter((task: Task) => {
        // Comprueba si el ID de la tarea está incluido en los IDs eliminados
        return !deletedIds.some((deletedId) => deletedId === task.id);
      });
      console.log(updatedTasks)
      localStorage.setItem("taskList", JSON.stringify(updatedTasks));
    }
  };
  

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedTaskList = Array.from(taskList);
    const [reorderedTask] = updatedTaskList.splice(result.source.index, 1);
    updatedTaskList.splice(result.destination.index, 0, reorderedTask);

    const updatedTaskListWithOrder = updatedTaskList.map((task, index) => ({
      ...task,
      TaskOrder: index,
    }));

    setTasks(updatedTaskListWithOrder);
    localStorage.setItem("taskList", JSON.stringify(updatedTaskListWithOrder));
  };

  useEffect(() => {
    ipcRenderer.on("syncTasksBeforeQuit", async () => {
      try {
        const taskList = localStorage.getItem("taskList");
        if (taskList) {
          let savedTasks = JSON.parse(taskList);
          await ipcRenderer.send("syncTasks", savedTasks, currentUser?.uid);
          const successListener = () => {
            ipcRenderer.removeAllListeners("syncTasksSuccess");
            ipcRenderer.send("syncTasksBeforeQuitComplete");
          };
          ipcRenderer.on("syncTasksSuccess", successListener);
        }
      } catch (error) {
        console.error(
          "Error while synchronizing tasks before quitting:",
          error
        );
      }
    });
  }, []);

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
                  taskList
                    .filter((task) => task.id !== undefined && !task.TaskStatus)
                    .map((task, index) => (
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
                                  checked={false}
                                  className="checkFinish"
                                  onClick={() => handleCompleteBtnClick(task)}
                                />
                                <div className="taskImage"></div>
                              </label>
                            </div>
                            <div className="taskContent">
                              <span className="taskNameCont group hover:group">
                                <h1 className="taskName">{task.TaskName}</h1>
                                <h3 className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  +{7 * task.TaskDiff} xp
                                </h3>
                              </span>
                              <div className="taskDesc">
                                <h3>{task.TaskDesc}</h3>
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
                                    checked={tasksToDelete.includes(
                                      task.id || 0
                                    )}
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
          taskList
            .filter((task) => task.id !== undefined && task.TaskStatus)
            .map((task, index) => (
              <div className="taskContainerFinished" key={index}>
                <div className="taskImgCont">
                  <label className="imgBtn">
                    <input
                      type="checkbox"
                      checked={true}
                      className="checkFinish"
                      onClick={() => handleCompleteBtnClick(task)}
                    />
                    <div className="taskImage"></div>
                  </label>
                </div>
                <div className="taskContent">
                  <h1 className="taskName">{task.TaskName}</h1>
                  <div className="taskDesc">
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
