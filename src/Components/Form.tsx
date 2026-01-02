import { useEffect, useState } from "react";
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";
import { useTranslation } from "react-i18next";
import type { IpcRendererEvent } from "../../electron/preload";
import divider from "../Assets/divider.png";
import "../Styles/Form.css";
import type { Task } from "../Data/Interfaces/taskTypes";
import { useAuth } from "@/AuthContext";
import { Howl, Howler } from "howler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import write from "../Assets/FX/write.mp3";
import joaco from "../Assets/FX/graciastio.mp3";
import i18n from "@/Data/i18n";
import SingleSelect from "./selectEdit"; // Asegúrate de importar el nuevo componente
import { Option } from "../Data/Interfaces/selectEdit";
import { subscribeTaskClasses, upsertTask } from "@/Data/firestore";

type Props = {
  editingTask: Task | null;
  onSaved?: () => void;
};

function Form({ editingTask, onSaved }: Props) {
  const ipcRenderer = (window as any).ipcRenderer; // solo lo dejamos por idioma/config (Electron)
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [useDate, setUseDate] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
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

  useEffect(() => {
    if (!editingTask) {
      setIsEdit(false);
      return;
    }

    setTaskName(editingTask.TaskName || "");
    setTaskDesc(editingTask.TaskDesc || "");
    setTaskId(editingTask.id || "");
    setTaskClass(
      editingTask.TaskClass
        ? { label: editingTask.TaskClass, value: editingTask.TaskClass }
        : null
    );

    const due = editingTask.TaskDueDate;
    if (due && typeof due === "object" && "seconds" in due) {
      const ms = due.seconds * 1000 + Math.round((due as any).nanoseconds / 1000000);
      setTaskDueDate(new Date(ms));
      setUseDate(true);
    } else if (due instanceof Date) {
      setTaskDueDate(due);
      setUseDate(true);
    } else {
      setUseDate(false);
      setTaskDueDate(null);
    }

    setIsEdit(true);
    setShowExtraOptions(true);
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const uid = currentUser?.uid;
    if (!uid) return;

    const newTask: Partial<Task> & { id?: string } = {
      id: taskId || undefined,
      TaskName: taskName,
      TaskDesc: taskDesc,
      TaskStatus: editingTask?.TaskStatus ?? false,
      TaskClass: taskClass ? taskClass.value : "",
      TaskDueDate: useDate ? taskDueDate : null,
      TaskOrder: editingTask?.TaskOrder ?? 0,
      // por ahora no calculamos IA acá (se puede enchufar después)
      TaskDiff: editingTask?.TaskDiff ?? 0,
    };

    if (newTask.TaskName !== "") {
      await upsertTask(uid, newTask);

      if (
        uid === "7MfCdgHwfgc3MchqqsHKRDvOzkm1" ||
        uid === "XkIjCIHs7xPLL3neZsMpFBBCeaG2"
      ) {
        joacoSound.play();
      } else {
        writeSound.play();
      }

      setTaskName("");
      setTaskDesc("");
      setTaskId("");
      setTaskClass(null);
      setTaskDueDate(null);
      setUseDate(false);
      const taskInput = document.getElementById("taskInput");
      taskInput?.classList.remove("needed");
      setIsEdit(false);
      setShowExtraOptions(false);
      onSaved?.();
    } else {
      const taskInput = document.getElementById("taskInput");
      taskInput?.classList.add("needed");
    }
  };

  const handleLang = (event: IpcRendererEvent, lang: string) => {
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

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const unsub = subscribeTaskClasses(uid, (classes) => {
      setClassOptions(classes.map((c) => ({ label: c, value: c })));
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleClassChange = (selectedOption: Option | null) => {
    setTaskClass(selectedOption);
  };

  // edición ahora se maneja vía props (TaskManager), no por IPC

  return (
    <div className="flex">
      <div className="container mx-auto py-4 flex flex-col items-center">
        <div className="titleContainer">
          <img src={titleLeft} alt="Title Left" className="titleImage mx-2" />
          <h1 className="titleText">Questify</h1>
          <img src={titleRight} alt="Title Right" className="titleImage mx-2" />
        </div>

        <div className="formCont w-full max-w-md mb-4">
          <div className={`formToolbar ${showExtraOptions ? "show" : ""}`}>
            <div className="formToggleRow">
              <div className="checkbox-wrapper-3">
                <input
                  type="checkbox"
                  id="cbx-3"
                  checked={useDate}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setUseDate(next);
                    if (!next) setTaskDueDate(null);
                  }}
                />
                <label
                  htmlFor="cbx-3"
                  className="toggle"
                  aria-label="Activar fecha límite"
                  title="Activar fecha límite"
                >
                  <span></span>
                </label>
              </div>
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
                <div
                  className={`selectInput ${
                    useDate ? "halfInput" : "fullInput"
                  }`}
                >
                  <SingleSelect
                    options={classOptions}
                    onChange={handleClassChange}
                    placeholder="Clase / Categoría"
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
                      placeholderText="Elegir fecha..."
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
