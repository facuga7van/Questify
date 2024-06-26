import { useEffect, useState } from "react";
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";
import { useTranslation } from "react-i18next";
import type { IpcRendererEvent } from "../../electron/preload";
import divider from "../Assets/divider.png";
import "../Styles/Form.css";
import { Task } from "../Data/Interfaces/taskTypes";
import { useAuth } from "@/AuthContext";
import { Howl, Howler } from "howler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import write from "../Assets/FX/write.mp3";
import joaco from "../Assets/FX/graciastio.mp3";
import i18n from "@/Data/i18n";
import SingleSelect from './selectEdit'; // Asegúrate de importar el nuevo componente
import { Option } from '../Data/Interfaces/selectEdit';

function Form() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [useDate, setUseDate] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [taskClass, setTaskClass] = useState<Option | null>(null);
  const [taskId, setTaskId] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [classOptions, setClassOptions] = useState<Option[]>([]);
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const writeSound = new Howl({
    src: [write],
    html5: true,
  });
  const joacoSound = new Howl({
    src: [joaco],
    html5: true,
  });
  Howler.volume(0.2);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newTask = {
      id: taskId,
      TaskName: taskName,
      TaskDesc: taskDesc,
      TaskStatus: false,
      TaskUser: currentUser?.uid,
      TaskClass: taskClass ? taskClass.value : "",
      TaskDueDate: useDate ? taskDueDate : null,
      TaskOrder: 0,
    };

    if (newTask.TaskName !== "") {
      ipcRenderer.send("addTask", newTask);
      setTaskName("");
      setTaskDesc("");
      setTaskId("");
      setTaskClass(null);
      setTaskDueDate(new Date());
      const taskInput = document.getElementById("taskInput");
      taskInput?.classList.remove("needed");
      setIsEdit(false);
      setShowExtraOptions(false);
    } else {
      const taskInput = document.getElementById("taskInput");
      taskInput?.classList.add("needed");
    }
  };

  const taskAdded = (event: IpcRendererEvent) => {
    if (1 > 2) {
      console.log(event);
    }
    if (
      currentUser?.uid === "7MfCdgHwfgc3MchqqsHKRDvOzkm1" ||
      currentUser?.uid === "XkIjCIHs7xPLL3neZsMpFBBCeaG2"
    ) {
      joacoSound.play();
    } else {
      writeSound.play();
    }
  };

  const handleLang = (event: IpcRendererEvent, lang: string) => {
    i18n.changeLanguage(lang);
    if (1 > 2) {
      console.log(event);
    }
  };

  useEffect(() => {
    ipcRenderer.on("taskAdded", taskAdded);
    ipcRenderer.on("changeLang", handleLang);
  }, []);

  useEffect(() => {
    const fetchClasses = () => {
      ipcRenderer.send("getTaskClasses", currentUser?.uid);
    };

    const handleShowClasses = (event: IpcRendererEvent, taskClasses: { className: string }[]) => {
      const options = taskClasses.map((item) => ({
        label: item.className,
        value: item.className,
      }));
      setClassOptions(options);
      console.log(taskClasses);
    };
    
    fetchClasses();
    ipcRenderer.on("showTaskClasses", handleShowClasses);

    return () => {
      ipcRenderer.removeAllListeners("showTaskClasses", handleShowClasses);
    };
  }, [currentUser]);

  const handleClassChange = (selectedOption: Option | null) => {
    setTaskClass(selectedOption);
  };

  const handleEditTask = (event: IpcRendererEvent, task: Task) => {
    setTaskName(task.TaskName || "");
    setTaskDesc(task.TaskDesc || "");
    setTaskId(task.id || "");
    setTaskClass(task.TaskClass ? { label: task.TaskClass, value: task.TaskClass } : null);
    if (1 < 2) {
      console.log(event);
    }
    setIsEdit(true);
    setShowExtraOptions(true);
  };

  useEffect(() => {
    ipcRenderer.on("sendTaskEdit", handleEditTask);
  }, []);

  return (
    <div className="flex">
      <div className="container mx-auto py-4 flex flex-col items-center">
        <div className="titleContainer">
          <img src={titleLeft} alt="Title Left" className="titleImage mx-2" />
          <h1 className="titleText">Questify - To Do List</h1>
          <img src={titleRight} alt="Title Right" className="titleImage mx-2" />
        </div>

        <div className="formCont w-full max-w-md mb-4">
          <div className={`checkDate flexRow ${showExtraOptions ? "show" : ""}`}>
            <div className="checkbox-wrapper-3">
              <input
                type="checkbox"
                id="cbx-3"
                checked={useDate}
                onChange={(e) => setUseDate(e.target.checked)}
              />
              <label htmlFor="cbx-3" className="toggle">
                <span></span>
              </label>
            </div>
          </div>

          <form id="taskForm" onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                id="taskInput"
                value={taskName}
                onChange={(e) => {
                  setTaskName(e.target.value);
                  if (e.target.value !== "") {
                    setShowExtraOptions(true);
                  } else {
                    setShowExtraOptions(false);
                  }
                }}
                className={`w-full px-4 py-2 rounded-md focus:outline-none`}
                placeholder={t("placeholder")}
                autoFocus
              />
            </div>
            <div className={`extraOptions ${showExtraOptions ? "show" : ""}`}>
              <div className="mb-4">
                <input
                  id="descInput"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-md focus:outline-none"
                  placeholder={t("questDescPlaceholder")}
                />
              </div>
              <div className="mb-4 dobleInput">
                <div className={`selectInput ${useDate ? "halfInput" : "fullInput"}`}>
                  <SingleSelect
                    options={classOptions}
                    onChange={handleClassChange}
                  />
                </div>
                {useDate && (
                  <div className="halfInput">
                    <DatePicker
                      id="dueDateInput"
                      showTimeSelect
                      filterDate={(date) => new Date() < date}
                      selected={taskDueDate}
                      onChange={(date) => date && setTaskDueDate(date)}
                      disabled={!useDate}
                      className="w-full px-4 py-2 rounded-md focus:outline-none dateInput"
                      dateFormat="MMMM d, yyyy h:mmaa"
                    />
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="rpgBtn w-full">
              {isEdit ? t("editQuest") : t("addQuest")}
            </button>
          </form>
        </div>
        <img src={divider} className="dividerImg" alt="Divider"></img>
      </div>
    </div>
  );
}

export default Form;
