import axios from "axios";
import { Task, Group, grouptask } from "./types";

const BASE_URL = "http://localhost:3000";


export const getallusers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/users`);
        return response
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
}

export const getSoloTask = async (userId: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/task/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};


export const getGroupUser = async (userId: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/GroupUsers/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const deleteGroupUser = async (iduser: number, groupid: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/groupuser/${iduser}`, {
            params: { idgroup: groupid },
        });
        return response.data;
    } catch (error) {
        console.error("Error add task:", error);
        throw error;
    }
}


export const getGroupTask = async (userId: number) => {
    try {
        const response = (await axios.get(`${BASE_URL}/groups/${userId}`)).data;
        const res: Group[] = []
        await Promise.all(response.map(async (i: { id: any; namegroup: any; }) => {
            const users = (await axios.get(`${BASE_URL}/usergroup/${i.id}`)).data.map((i: { iduser: any; }) => i.iduser)
            let usersdata: any[] = []
            let temp: any[] = []
            await Promise.all(users.map(async (i: number) => {
                temp.push(await getGroupUser(i))
            }));
            usersdata = [].concat(...temp)
            const task = (await axios.get(`${BASE_URL}/GroupTask/${i.id}`)).data
            res.push({
                "id": i.id,
                "name": i.namegroup,
                "users": usersdata,
                "grouptask": task
            })
        }))
        return res;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
}

export const updateSoloTask = async (task: Task) => {
    try {
        const response = await axios.put(`${BASE_URL}/taskupdate`, {
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
            userid: task.userid,
            deadline: task.deadline.toISOString(),
        });
        return response.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
}

export const deleteSoloTask = async (taskid: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/task/${taskid}`)
        return response.data;
    } catch (error) {
        console.error("Error add task:", error);
        throw error;
    }
}

export const deleteGroup = async (groupid: number) => {
    try {
        await axios.delete(`${BASE_URL}/groupTasks/${groupid}`)
        await axios.delete(`${BASE_URL}/groupUsers/${groupid}`)
        await axios.delete(`${BASE_URL}/group/${groupid}`)
        return
    } catch (error) {
        console.error("Error add task:", error);
        throw error;
    }
}

export const addGroupTask = async (groupId: number, task: Partial<grouptask>) => {
    try {
      const response = await axios.post(`${BASE_URL}/grouptasks`, {
        ...task,
        groupid: groupId, // Используем groupid вместо idgroup
        deadline: task.deadlinedate?.toISOString(), // Преобразуем дату в ISO-строку
      });
      return response.data;
    } catch (error) {
      console.error("Error adding group task:", error);
      throw error;
    }
  };

export const deleteGroupTask = async (taskId: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/grouptasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting group task:", error);
      throw error;
    }
  };

// Обновление статуса групповой задачи
export const updateGroupTaskStatus = async (taskId: number, status: boolean) => {
    try {
        const response = await axios.put(`${BASE_URL}/grouptasks/${taskId}`, {
            status,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating group task status:", error);
        throw error;
    }
};

export const postSoloTask = async (userid: number, task: { name: string; description: string; status: boolean; deadline: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}/task/${userid}`, {
            name: task.name,
            description: task.description,
            status: task.status,
            deadline: task.deadline,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding task:", error);
        throw error;
    }
};

export const postGroupUser = async (userid: number, idgroup: number) => {
    try {
        const response = await axios.post(`${BASE_URL}/UsersGroups/${userid}`, {
            groupid: idgroup
        })
        return response
    } catch (error) {
        console.error("Error adding group:", error);
        throw error;
    }
}

export const postGroup = async (userid: number, Namegroup: string) => {
    try {
        const temp = await axios.post(`${BASE_URL}/Groups/${Namegroup}`)
        await axios.post(`${BASE_URL}/UsersGroups/${userid}`, {
            groupid: temp.data[0].id
        })
        return ({ id: temp.data[0].id, namegroup: Namegroup })
    } catch (error) {
        console.error("Error adding group:", error);
        throw error;
    }
}