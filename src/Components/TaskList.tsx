import React, { useEffect, useRef, useState } from "react";
import type { IpcRendererEvent } from "../../electron/preload";
import "../Styles/TaskList.css";
import { Task } from "../Data/Interfaces/taskTypes";
import delImg from "../Assets/Trash.png";
import editImg from "../Assets/edit.png";
import divider from "../Assets/divider2.png";
import { useAuth } from "../AuthContext/index";

function TaskList() {
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const [taskList, setTasks] = useState<Task[]>([
    { id: undefined, TaskName: "Loading tasks...", TaskDesc: "", TaskStatus: false,TaskDiff:0,TaskUser:{
      uid: "",
      displayName: null,
      email: null
    } },
  ]);
  const [tasksToDelete, setTasksToDelete] = useState<number[]>([]);
  const [getTasks, setGetTasks] = useState(false);

  const hasConfirmedTasks = taskList.some(
    (task) => task.id !== undefined && task.TaskStatus
  );
  const [getXp, setGetXp] = useState(false);
  

  useEffect(() => {
    setGetTasks(true);
  }, []);

  useEffect(() => {
    setGetXp(true);
  }, []);
  if (1>2){
    console.log(getXp)
  }
  useEffect(() => {
    const handleShowTasks = (event: IpcRendererEvent, tasks: Task[]) => {
      console.log(tasks);
      setTasks(tasks.reverse());
      setGetTasks(false);
      if (1 > 2) {
        console.log(event);
      }
    };

    console.log("getTasks");
    if (getTasks) {
      ipcRenderer.send("getTasks", currentUser?.uid);
    }
    ipcRenderer.on("showTasks", handleShowTasks);

    return () => {
      ipcRenderer.removeAllListeners("showTasks", handleShowTasks);
    };
  }, [getTasks, currentUser]);

  const handleDeleteBtnClick = () => {
    if (tasksToDelete.length > 0) {
      ipcRenderer.send("deleteTask", tasksToDelete);
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
          maxHeight = windowHeight * 0.5;
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
      await ipcRenderer.send("editTask", task.id, currentUser?.uid); // Await the promise for synchronous behavior
      console.log("Task edit request sent successfully"); // Optional success message
    } catch (error) {
      console.error("Error sending edit request:", error); // Handle errors gracefully
    }
  };

  const handleCompleteBtnClick = async (task: Task) => {
    try {
      await setTasksToDelete(tasksToDelete.filter((id) => id !== task.id));
      await ipcRenderer.send("changeStatusTask", task.id,currentUser?.uid);
      console.log("Task edit request sent successfully");
    } catch (error) {
      console.error("Error sending edit request:", error);
    }
  };

  const handleEditTask = (event: IpcRendererEvent) => {
    setGetTasks(true);
    if (1 < 2) {
      console.log(event);
    }
    ipcRenderer.removeAllListeners("taskAdded");
  };

  ipcRenderer.on("taskAdded", handleEditTask);

  const [xpGained, setXpGained] = useState(0);
  const expAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleXPChange = (event: IpcRendererEvent, newXpGained: number) => {
      if (newXpGained > 0) {
        setXpGained(newXpGained);
        setGetXp(false);
      } else {
        setXpGained(0);
        setGetXp(false);
      }
      if (1 > 2) {
        console.log(event);
      }
      ipcRenderer.removeAllListeners("changeXP", handleXPChange);
    };

    ipcRenderer.on("changeXP", handleXPChange);

    const expAlertElement = document.getElementById("expAlert");
    if (expAlertElement && expAlertRef.current) {
      expAlertRef.current.textContent = `+${xpGained}xp`;
    }
  });

  useEffect(() => {
    const handleDeleteTaskSuccess = (
      event: IpcRendererEvent,
      deletedIds: number[]
    ) => {
      const updatedTaskList = taskList.filter(
        (task) => !deletedIds.includes(task.id || 0)
      );
      setTasks(updatedTaskList);
      if (1 < 2) {
        console.log(event);
      }

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

  return (
    <div>
      <div className="w-full flex justify-end items-center mx-auto space-y-2 max-w-lg">
        <div className="DeleteBtn">
          <img
            src={delImg}
            className={tasksToDelete.length > 0 ? "DeleteOn" : "DeleteOff"}
            onClick={handleDeleteBtnClick}
          />
        </div>
      </div>

      <div
        id="taskList"
        className="w-full items-center mx-auto space-y-2 max-w-lg"
      >
        {taskList
          .filter((task) => task.id !== undefined && !task.TaskStatus)
          .map((task, index) => (
            <div className="taskContainer" key={index}>
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
                      onChange={(event) => handleCheckDeleteChange(event, task)}
                      checked={tasksToDelete.includes(task.id || 0)}
                    />
                    <div className="taskCheck"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        {hasConfirmedTasks && (
          <div className="divider">
            <img src={divider} className="dividerImg" alt="Divider"></img>
          </div>
        )}
        {taskList
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
    </div>
  );
}

export default TaskList;
