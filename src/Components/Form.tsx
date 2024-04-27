import { useState } from 'react';
import titleLeft from '../Assets/titleLeft.png';
import titleRight from '../Assets/titleRight.png';
import type { IpcRendererEvent } from '../../electron/preload';
import divider from '../Assets/divider.png';
import '../Styles/Form.css';
import { Task } from '../Data/Interfaces/taskTypes';

function Form() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [idTask, setidTask] = useState('');
  const [isEdit, setIsEdit] = useState(false); 

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newTask = {
      idTask: idTask, 
      TaskName: taskName,
      TaskDesc: taskDesc,
      TaskStatus: false,
    };

    if (newTask.TaskName !== '') {
      console.log('se agrega')
      ipcRenderer.send('addTask', JSON.stringify(newTask));
      setTaskName('');
      setTaskDesc('');
      setidTask('');
      const taskInput = document.getElementById('taskInput');
      taskInput?.classList.remove('needed'); // Add the class conditionally
      setIsEdit(false);
    }else{
      const taskInput = document.getElementById('taskInput');
      taskInput?.classList.add('needed'); // Add the class conditionally

    }
  };


  const handleEditTask = (event: IpcRendererEvent,task: Task) => {
    setTaskName(task.TaskName || ''); // Set empty string if TaskName is missing
    setTaskDesc(task.TaskDesc || ''); // Set empty string if TaskDesc is missing
    setidTask(task.idTask);
    if (1<2){
      console.log(event)
    }
    ipcRenderer.removeAllListeners('sendTaskEdit');
    setIsEdit(true);
  };

  ipcRenderer.on('sendTaskEdit', handleEditTask);

  return (
    <div className='container mx-auto py-4 flex flex-col items-center'>
      <div className="titleContainer my-5">
        <img src={titleLeft} alt="Title Left" className="titleImage mx-2" />
        <h1 className="text-4xl font-semibold">Questify - To Do List</h1>
        <img src={titleRight} alt="Title Right" className="titleImage mx-2" />
      </div>
      <div className="w-full max-w-md mb-4">
        <form id="taskForm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              id="taskInput"
              value={taskName} // Directly assign value from state
              onChange={(e) => {
                setTaskName(e.target.value);
      
                // Remove the "needed" class if the input is not empty
                if (taskName !== '') {
                  const taskInput = document.getElementById('taskInput');
                  taskInput?.classList.remove('needed');
                }
              }}
              className={`w-full px-4 py-2 rounded-md focus:outline-none`}
              placeholder="Add a new quest..."
              autoFocus
            />
          </div>
          <div className="mb-4">
            <input
              id="descInput"
              value={taskDesc} // Directly assign value from state
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full px-4 py-2 rounded-md focus:outline-none"
              placeholder="Quest description"
            />
          </div>
          <button type="submit" className="rpgBtn w-full">
            {isEdit ? 'Edit Quest' : 'Add Quest'}
          </button>
        </form>
      </div>
      <img src={divider} className="dividerImg" alt="Divider"></img>
    </div>
  );
}

export default Form;