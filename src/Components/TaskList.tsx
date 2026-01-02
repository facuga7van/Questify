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
import {
  deleteTasks,
  incrementUserXp,
  setTaskStatus,
  subscribeTaskClasses,
  subscribeTasks,
  syncTaskOrders,
} from "@/Data/firestore";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Menu,
} from "@mui/material"; // Importar MUI
import MoreVertIcon from "@mui/icons-material/MoreVert";
// import SortIcon from '@mui/icons-material/Sort';

type Props = {
  onEditTask: (task: Task) => void;
};

function TaskList({ onEditTask }: Props) {
  const ipcRenderer = (window as any).ipcRenderer; // solo para idioma/config (Electron)
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [tasksToDelete, setTasksToDelete] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState("pending");
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("taskListPnd");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [filter, setFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value as string);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const unsub = subscribeTasks(uid, (tasks) => {
      const completed = tasks.filter((task) => task.TaskStatus === true);
      const pending = tasks
        .filter((task) => task.TaskStatus === false)
        .sort((a, b) => (a.TaskOrder ?? 0) - (b.TaskOrder ?? 0));

      setCompletedTasks(completed);
      setPendingTasks(pending);
      localStorage.setItem("taskListPnd", JSON.stringify(pending));
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const handleDeleteBtnClick = () => {
    const uid = currentUser?.uid;
    if (!uid) return;
    if (tasksToDelete.length > 0) {
      deleteTasks(uid, tasksToDelete).then(() => setTasksToDelete([]));
    }
  };

  const formatDate = (date: any): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    if (date instanceof Date) {
      return `${date.toLocaleDateString("es-ES")} ${date.toLocaleTimeString(
        "es-ES",
        options
      )}`;
    } else if (date && date.seconds && typeof date.seconds === "number") {
      const milliseconds =
        date.seconds * 1000 + Math.round(date.nanoseconds / 1000000);
      const dateObject = new Date(milliseconds);
      return `${dateObject.toLocaleDateString(
        "es-ES"
      )} ${dateObject.toLocaleTimeString("es-ES", options)}`;
    } else {
      return "";
    }
  };

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

  const handleCompleteBtnClick = async (task: Task) => {
    const uid = currentUser?.uid;
    if (!uid || !task.id) return;

    try {
      const toggled: Task = { ...task, TaskStatus: !task.TaskStatus };
      setPendingTasks((prev) =>
        toggled.TaskStatus
          ? prev.filter((t) => t.id !== task.id)
          : [...prev.filter((t) => t.id !== task.id), toggled]
      );
      setCompletedTasks((prev) =>
        toggled.TaskStatus
          ? [...prev.filter((t) => t.id !== task.id), toggled]
          : prev.filter((t) => t.id !== task.id)
      );

      const xpToAdd = toggled.TaskStatus ? toggled.TaskDiff * 7 : -toggled.TaskDiff * 7;
      setXpGained(xpToAdd);

      await setTaskStatus(uid, task.id, toggled.TaskStatus);
      if (xpToAdd !== 0) {
        await incrementUserXp(uid, xpToAdd);
      }
    } catch (error) {
      console.error("Error sending edit request:", error);
    }
  };

  const handleLang = async (event: IpcRendererEvent, lang: string) => {
    i18n.changeLanguage(lang);
    if (1 > 2) {
      console.log(event);
    }
  };

  useEffect(() => {
    ipcRenderer.on("changeLang", handleLang);

    return () => {
      ipcRenderer.off("changeLang", handleLang);
    };
  }, []);

  

  const [xpGained, setXpGained] = useState(0);
  const expAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const expAlertElement = document.getElementById("expAlert");
    if (expAlertElement && expAlertRef.current) {
      expAlertRef.current.textContent = `+${xpGained}xp`;
    }
  }, [xpGained]);
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
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const uid = currentUser?.uid;
    if (!uid) return;
    const updatedTasks = [...pendingTasks];
    const [reorderedTask] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, reorderedTask);
    updatedTasks.forEach((task, index) => {
      task.TaskOrder = index;
    });
    setPendingTasks(updatedTasks);
    localStorage.setItem("taskListPnd", JSON.stringify(updatedTasks));
    try {
      await syncTaskOrders(
        uid,
        updatedTasks
          .filter((t) => !!t.id)
          .map((t) => ({ id: t.id as string, TaskOrder: t.TaskOrder }))
      );
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  };
  const handleDetailClick = (taskId: string) => {
    setShowDetail((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const unsub = subscribeTaskClasses(uid, (classes) => setClassOptions(classes));
    return () => unsub();
  }, [currentUser?.uid]);

  // const handleNewClass = async (event: IpcRendererEvent, lang: string) => {
  //   i18n.changeLanguage(lang);
  //   if (1 > 2) {
  //     console.log(event);
  //   }
  // };

  // useEffect(() => {
  //   ipcRenderer.on("refreshClassList", handleNewClass);

  //   return () => {
  //     ipcRenderer.removeAllListeners("refreshClassList");
  //   };
  // }, []);

  const filteredTasks = pendingTasks.filter(
    (task) => filter === "" || task.TaskClass === filter
  );

  const sortedTasks = filteredTasks.sort((a, b) => {
    if(1>2){
      setSortOrder('a')
    }
    if (sortOrder === "difficulty") {
      return b.TaskDiff - a.TaskDiff; // Sort by difficulty in descending order
    } else if (sortOrder === "dueDate") {
      const toMs = (d: any) => {
        if (!d) return 0;
        if (d instanceof Date) return d.getTime();
        if (typeof d === "object" && "seconds" in d) {
          return d.seconds * 1000 + Math.round((d as any).nanoseconds / 1000000);
        }
        return new Date(d).getTime();
      };
      return (
        toMs(a.TaskDueDate) - toMs(b.TaskDueDate)
      ); // Sort by due date in ascending order
    } else if (sortOrder === "alphabetical") {
      return a.TaskName.localeCompare(b.TaskName); // Sort by task name alphabetically
    }
    return 0;
  });

  // Termina clases
  return (
    <div>
      <div
        id="taskList"
        className="w-full items-center mx-auto space-y-2 max-w-lg"
      >
        <div className="tabsCont">
          <div className="tabs">
            <div className="tabDropdownBtn">
              <IconButton
                aria-label="more"
                aria-controls="customized-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
            </div>
            <Menu
              id="customized-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              className="dropdownMenu"
            >
              <MenuItem>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>{t("filterByClass")}</InputLabel>
                  <Select value={filter} onChange={handleFilterChange}>
                    <MenuItem value="">{t("allClasses")}</MenuItem>
                    {classOptions.map((classOption) => (
                      <MenuItem key={classOption} value={classOption}>
                        {classOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MenuItem>
              {/* <MenuItem>
              <FormControl className="sort" variant="standard" fullWidth>
                  <InputLabel>{t("sortBy")}</InputLabel>
                  <Select value={sortOrder} onChange={handleSortOrderChange}>
                    <MenuItem value="asc">{t("ascending")}</MenuItem>
                    <MenuItem value="desc">{t("descending")}</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem> */}
            </Menu>

            <div className="tabBtns">
              <button
                className={`tabBtn tab ${
                  activeTab === "pending" ? "active" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                <a>{t("pendings")}</a>
              </button>
              <button
                className={`tabBtn tab ${
                  activeTab === "completed" ? "active" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                <a>{t("completed")}</a>
              </button>
            </div>
            
            {/* <div className="tabDropdownBtn">
              <IconButton
                aria-label="more"
                aria-controls="customized-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <SortIcon />
              </IconButton>
            </div>
            <Menu
              id="customized-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              className="dropdownMenu"
            >
              <MenuItem>
              <FormControl className="sort" variant="standard" fullWidth>
                  <InputLabel>{t("sortBy")}</InputLabel>
                  <Select value={sortOrder} onChange={handleSortOrderChange}>
                    <MenuItem value="asc">{t("ascending")}</MenuItem>
                    <MenuItem value="desc">{t("descending")}</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
            </Menu> */}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeTab === "pending" &&
                  sortedTasks.map((task, index) => (
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
                            <span
                              className="taskNameCont group hover:group"
                              onClick={() =>
                                handleDetailClick(task.id || `task-${index}`)
                              }
                            >
                              <h1 className="taskName">{task.TaskName}</h1>
                              <h3 className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                +{7 * task.TaskDiff} xp
                              </h3>
                            </span>
                            <div className={`TaskDetail`}>
                              {showDetail[task.id || `task-${index}`] && (
                                <>
                                  <div className="taskDet1">
                                    {task.TaskClass && (
                                      <p>{t(task.TaskClass)}</p>
                                    )}
                                    {task.TaskDiff && (
                                      <p>
                                        {`${getTaskDifficultyLabel(
                                          task.TaskDiff
                                        )}`}
                                      </p>
                                    )}
                                    {task.TaskDueDate && (
                                      <span className="taskDate">
                                        {formatDate(task.TaskDueDate)}
                                      </span>
                                    )}
                                  </div>
                                  {task.TaskDesc !== "" && (
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
                                onClick={() => onEditTask(task)}
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
