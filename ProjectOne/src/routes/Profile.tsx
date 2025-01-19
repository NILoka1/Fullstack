import { Text, Button, Progress, Accordion, Modal, TextInput } from "@mantine/core";
import { DateTimePicker } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useDisclosure } from '@mantine/hooks';
import { getSoloTask, getGroupTask, updateSoloTask, postSoloTask, deleteSoloTask, postGroup, deleteGroup, addGroupTask, deleteGroupTask, updateGroupTaskStatus } from "../functions/api";
import { Task, rendertask, grouptask, Group, } from "../functions/types"
import '@mantine/dates/styles.css';
import RenderGroup from "../functions/RenderGroup"; 


const Profile = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [rendertasks, setrenderTasks] = useState<JSX.Element[]>();
    const [newtasks, setNewTasks] = useState<{ name: string, description: string, status: boolean, deadline: Date; }>({ name: "", description: "", status: false, deadline: new Date(2015, 0, 1) });
    const [openednewtasks, { open, close }] = useDisclosure(false);

    const [group, setgroup] = useState<Group[]>([]);
    const [renderGroups, setrenderGroups] = useState<JSX.Element[]>();
    const [newGroup, setNewGroup] = useState<string>("База")
    const [openednewgroup, { open: opengroup, close: closegroup }] = useDisclosure(false);

    const [grouptasks, setgroupTasks] = useState<grouptask[]>([]);
    const [renderGroupTasks, setRenderGroupTasks] = useState<JSX.Element[]>();
    const [newGroupTasks, setNewGroupTasks] = useState<Partial<grouptask>>({
        idgroup: 1,
        name: "",
        description: "",
        status: false,
        deadlinedate: new Date(),
    });
    const [openednewGroupTasks, { open: openGroupTasks, close: closeGroupTasks }] = useDisclosure(false);
    const [isLoading, setIsLoading] = useState(true);

    const [progress, setProgress] = useState(0);
    const [groupprogress, setgroupprogress] = useState(0)

    const [openednewuser, { open: adduseropen, close: adduserclose }] = useDisclosure(false);

    const exit = () => {
        localStorage.removeItem('user');
        navigate('/');
    }

    const handleDeleteGroup = async (groupid: number) => {
        try {
            await deleteGroup(groupid)

            const updatedGroup = group.filter(group => group.id !== groupid);
            setgroup(updatedGroup);
        } catch (error) {
            console.error("Error deleting task:", error);
        }

    }
    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteSoloTask(taskId);
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            const completedTasks = updatedTasks.filter(task => task.status).length;
            setProgress(completedTasks);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
    const handleDeleteGroupTask = async (taskId: number) => {
        try {
            await deleteGroupTask(taskId);
            setgroupTasks((prevTasks) => prevTasks?.filter(task => task.idtask !== taskId) || []);
            setgroup((prevGroups) =>
                prevGroups.map((group) => ({
                    ...group,
                    grouptask: group.grouptask.filter(task => task.idtask !== taskId),
                }))
            );

        } catch (error) {
            console.error("Error deleting group task:", error);
        }
    };
    useEffect(() => {
        setrenderTasks(tasks.map(task => task.render(newProgress, handleDeleteTask)));
    }, [tasks]);

    useEffect(() => {
        if (grouptasks && grouptasks.length > 0) {
            const renderedTasks = grouptasks.map(task => rendertask(task, newProgressGroup, handleDeleteGroupTask))
            setRenderGroupTasks(renderedTasks);

            const completedTasks = grouptasks.filter(task => task.status).length;
            setgroupprogress((completedTasks / grouptasks.length) * 100);
        } else {
            setRenderGroupTasks([]);
            setgroupprogress(0);
        }
    }, [grouptasks]);

    const handleUpdateGroup = (updatedGroup: Group) => {
        setgroup((Groups) =>
            Groups.map((group) =>
                group.id === updatedGroup.id ? updatedGroup : group
            )
        );
    };
    useEffect(() => {
        getGroupTaskVoid()
        setrenderGroups(group.map(group => (
            <RenderGroup
                key={group.id}
                group={group}
                onDelete={handleDeleteGroup}
                openednewuser={openednewuser}
                open={adduseropen}
                close={adduserclose}
                onUpdateGroup={handleUpdateGroup}
            />
        )));
    }, [group, openednewuser]);

    const newProgress = async (id: number, isChecked: boolean) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === id);
            if (!taskToUpdate) return;
            const updatedTask = new Task(
                taskToUpdate.id,
                taskToUpdate.name,
                taskToUpdate.description,
                isChecked,
                taskToUpdate.userid,
                taskToUpdate.deadline
            );
            await updateSoloTask(updatedTask);
            const updatedTasks = tasks.map(task =>
                task.id === id ? updatedTask : task
            );
            setTasks(updatedTasks);
            const completedTasks = updatedTasks.filter(task => task.status).length;
            setProgress(completedTasks);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };
    const newProgressGroup = async (id: number, isChecked: boolean) => {
        await updateGroupTaskStatus(id, isChecked);
        setgroupTasks((prevTasks) => {
            if (!prevTasks) return prevTasks;

            const updatedTasks = prevTasks.map((task) =>
                task.idtask === id ? { ...task, status: isChecked } : task
            );

            const completedTasks = updatedTasks.filter((task) => task.status).length;
            const totalTasks = updatedTasks.length;
            setgroupprogress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);

            return updatedTasks;
        });
    };

    const getSoloTaskVoid = async () => {
        const tasksData = await getSoloTask(user.id);
        const tasks = tasksData.map((i: Task) => new Task(i.id, i.name, i.description, i.status, i.userid, new Date(i.deadline)));
        const initialProgress = tasks.filter((task: { status: any; }) => task.status).length;
        setTasks(tasks);
        setProgress(initialProgress);
        setrenderTasks(tasks.map((task: { render: (arg0: (id: number, isChecked: boolean) => Promise<void>, arg1: (taskId: number) => Promise<void>) => any; }) => task.render(newProgress, handleDeleteTask)))
    };

    const getGroupVoid = async () => {
        try {
            const groupdata = await getGroupTask(user.id);
            setgroup(groupdata);
        } catch (error) {
            console.error("Error loading groups:", error);
        }
    };
    const getGroupTaskVoid = async () => {
        try {
            const groupTasks: grouptask[] = group.flatMap(group => group.grouptask);
            setgroupTasks(groupTasks);

            const completedTasks = groupTasks.filter(task => task.status).length;
            const totalTasks = groupTasks.length
            setgroupprogress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
        } catch (error) {
            console.error("Error loading group tasks:", error);
        }
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                await getSoloTaskVoid();
                await getGroupVoid();
                await getGroupTaskVoid();
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [user.id]);

    const newtaskvoid = async (id: number, newtasks: { name: string; description: string; status: boolean; deadline: Date }) => {
        try {
            const response = await postSoloTask(id, {
                name: newtasks.name,
                description: newtasks.description,
                status: newtasks.status,
                deadline: newtasks.deadline.toISOString(),
            });
            const newTask = new Task(
                response.id,
                response.name,
                response.description,
                response.status,
                id,
                new Date(response.deadline)
            );
            setTasks((prevTasks) => [...prevTasks, newTask]);
            const completedTasks = tasks.filter(task => task.status).length;
            setProgress(completedTasks);
            close();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };
    const newGroupVoid = async (userid: number, groupname: string) => {
        try {
            const newGroupData = await postGroup(userid, groupname)
            const newGroupInstance: Group = ({
                id: newGroupData.id,
                name: newGroupData.namegroup,
                users: [{ id: user.id, username: user.username }],
                grouptask: []
            }
            );
            setgroup([...group, newGroupInstance])
            closegroup();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }
    const newGroupTaskVoid = async (newTask: Partial<grouptask>) => {
        try {
            if (newTask.idgroup === undefined || isNaN(newTask.idgroup)) {
                console.error("ID группы не указан или указан некорректно");
                return;
            }

            const response = await addGroupTask(newTask.idgroup, newTask);

            const newTaskData: grouptask = {
                idtask: response.idtask,
                name: response.name,
                description: response.description,
                status: response.status,
                deadlinedate: new Date(response.deadlinedate),
                idgroup: newTask.idgroup,
            };

            setgroupTasks((prevTasks) => (prevTasks ? [...prevTasks, newTaskData] : [newTaskData]));

            closeGroupTasks();
        } catch (error) {
            console.error("Error adding group task:", error);
        }
    };
    return (
        <div>
            <div className="ProfileHead">
                <Text size="lg">Выполнен вход: {user.username}</Text>
                <Button onClick={() => exit()} className="ButtonExit" variant="transparent" color="rgba(255, 0, 0, 1)" size="lg">Выход</Button>
            </div>
            <hr />
            <div className="ProfileBody">
                <div className="IndividualTask">
                    <Text size="sm">Личный прогресс:</Text>
                    <Progress className="progress" color="rgba(15, 219, 32, 1)" radius="xl" size="lg" value={(progress / tasks.length) * 100} />
                    <div className="task-container">
                        <Accordion defaultValue="">
                            {rendertasks}
                        </Accordion>
                    </div>
                    <div className="addTaskButton">
                        <Button justify='center' onClick={open} radius="xl" fullWidth>
                            <Text className='RegAndAutoButton'>Добавить новую задачу</Text>
                        </Button>
                    </div>
                    <Modal className='Auto' opened={openednewtasks} onClose={close}>
                        <div>
                            <TextInput onChange={(Event) => setNewTasks({ ...newtasks, name: Event.target.value })} radius="xl" label="Введите имя задачи"></TextInput>
                            <TextInput onChange={(Event) => setNewTasks({ ...newtasks, description: Event.target.value })} radius="xl" label="Введите описание задачи"></TextInput>
                            <DateTimePicker
                                valueFormat="DD/MM/YYYY HH:mm:ss"
                                label="Выберите дату и время"
                                placeholder="Выберите дату и время"
                                value={newtasks.deadline}
                                onChange={(value) => {
                                    if (value) {
                                        setNewTasks((prev) => ({ ...prev, deadlinedate: value }));
                                    }
                                }}
                                radius="xl"
                                size="xs"
                            />
                            <Button
                                justify="center"
                                onClick={() => newtaskvoid(user.id, newtasks)}
                                radius="xl"
                            >
                                <Text className="RegAndAutoButton">Добавить новую задачу</Text>
                            </Button>
                        </div>
                    </Modal>
                </div>
                <div className="IndividualTask">
                    <Text size="sm">Групы: </Text>
                    <div className="task-container">
                        <Accordion defaultValue="">
                            {renderGroups}
                        </Accordion>
                    </div>
                    <div className="addTaskButton">
                        <Button justify='center' onClick={opengroup} radius="xl" fullWidth>
                            <Text className='RegAndAutoButton'>Добавить новую группу</Text>
                        </Button>
                    </div>
                    <Modal className='Auto' opened={openednewgroup} onClose={closegroup}>
                        <div>
                            <TextInput onChange={(Event) => setNewGroup(Event.target.value)} radius="xl" label="Введите имя группы"></TextInput>
                            <Button justify='center' onClick={() => newGroupVoid(user.id, newGroup)} radius="xl"><Text className='RegAndAutoButton'>Добавить новую группу</Text></Button>
                        </div>
                    </Modal>
                </div>
                <div className="IndividualTask">
                    <div>
                        {isLoading ? (
                            <Text>Загрузка...</Text> 
                        ) : (
                            <div>
                                <Text size="sm">Общий прогресс:</Text>
                                <Progress
                                    className="progress"
                                    color="rgba(15, 219, 32, 1)"
                                    radius="xl"
                                    size="lg"
                                    value={groupprogress} 
                                /> <Accordion defaultValue="">
                                    {renderGroupTasks}
                                </Accordion>
                            </div>
                        )}
                    </div>
                    <div className="addTaskButton">
                        <Button justify='center' onClick={openGroupTasks} radius="xl" fullWidth>
                            <Text className='RegAndAutoButton'>Добавить новую задачу</Text>
                        </Button>
                    </div>
                    <Modal className='Auto' opened={openednewGroupTasks} onClose={closeGroupTasks}>
                        <div>
                            <TextInput onChange={(Event) => setNewGroupTasks({ ...newGroupTasks, idgroup: parseInt(Event.target.value) })} radius="xl" label="Введите id группы"></TextInput>
                            <TextInput onChange={(Event) => setNewGroupTasks({ ...newGroupTasks, name: Event.target.value })} radius="xl" label="Введите имя задачи"></TextInput>
                            <TextInput onChange={(Event) => setNewGroupTasks({ ...newGroupTasks, description: Event.target.value })} radius="xl" label="Введите описание задачи"></TextInput>
                            <DateTimePicker
                                valueFormat="DD/MM/YYYY HH:mm:ss"
                                label="Выберите дату и время"
                                placeholder="Выберите дату и время"
                                value={newGroupTasks.deadlinedate}
                                onChange={(value) => {
                                    if (value) { setNewGroupTasks({ ...newtasks, deadlinedate: value }); }
                                }}
                                radius="xl"
                                size="xs"
                            />
                            <Button justify='center' onClick={() => newGroupTaskVoid(newGroupTasks)} radius="xl"><Text className='RegAndAutoButton'>Добавить новую задачу</Text></Button>

                        </div>
                    </Modal>
                </div>
            </div>

        </div>
    );
}

export default Profile;