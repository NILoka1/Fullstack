import { useState, useEffect } from 'react';
import { Modal, Button, Text, Accordion, Flex } from '@mantine/core';
import { getallusers, deleteGroupUser,postGroupUser } from './api';

interface Group {
    id: number;
    name: string;
    users: { id: number; username: string }[];
    grouptask: any[];
}

interface RenderGroupProps {
    group: Group;
    onDelete: (groupid: number) => Promise<void>;
    openednewuser: boolean;
    open: () => void;
    close: () => void;
    onUpdateGroup: (updatedGroup: Group) => void;
}

const RenderGroup = ({ group, onDelete, openednewuser, open, close, onUpdateGroup }: RenderGroupProps) => {
    const [notAddedUsers, setNotAddedUsers] = useState<any[]>([]);

    const fetchNotAddedUsers = async () => {
        const AddUsers = group.users;
        const allUserdata = (await getallusers()).data;
        const allUsers = allUserdata.map((i: { id: any; username: any }) => ({
            id: i.id,
            username: i.username,
        }));
        const notaddusers = allUsers.filter(
            (user: { id: number }) => !AddUsers.some((adduser) => adduser.id === user.id)
        );
        setNotAddedUsers(notaddusers);
    };


    useEffect(() => {
        fetchNotAddedUsers();
    }, [group]);

    const handleAddUser = (user: { id: number; username: string }) => {
        const updatedGroup = {
            ...group,
            users: [...group.users, user],
        };
        onUpdateGroup(updatedGroup);
        setNotAddedUsers((prev) => prev.filter((u) => u.id !== user.id));
        postGroupUser(user.id, group.id)
    };
    

    const handleRemoveUser = (user: { id: number; username: string }) => {
        const updatedGroup = {
            ...group,
            users: group.users.filter((u) => u.id !== user.id),
        };
        onUpdateGroup(updatedGroup);
        setNotAddedUsers((prev) => [...prev, user]);
        deleteGroupUser(user.id, group.id)
    };

    const AddUser = (user: { username: string; id: number }) => {
        return (
            <div key={user.id}>
                <Button onClick={() => handleRemoveUser(user)}>
                    <Text className="black-text">{user.username}</Text>
                </Button>
            </div>
        );
    };

    // Функция для рендера не добавленных пользователей
    const NotAddedUser = (user: { username: string; id: number }) => {
        return (
            <div key={user.id}>
                <Button onClick={() => handleAddUser(user)}>
                    <Text className="black-text">{user.username}</Text>
                </Button>
            </div>
        );
    };

    // Функция для рендера участников группы
    const rUsers = () => {
        if (group.users.length === 0) {
            return <Text>Вы</Text>;
        }
        return group.users.map((i) => (
            <Text key={i.id - 1000}>{i.username}</Text>
        ));
    };

    return (
        <div key={group.id}>
            <Accordion.Item className="AccItem" value={group.id.toString()}>
                <div>
                    <Accordion.Control>
                        <div className="Task">
                            <Text>{group.name}</Text>
                        </div>
                    </Accordion.Control>
                    <Accordion.Panel className="AccPanel">
                        <div>Учасники: {rUsers()}</div>
                        <div>
                            <Button variant="outline" color="red" size="xs" onClick={() => onDelete(group.id)}>
                                Удалить
                            </Button>
                            <Button variant="outline" color="blue" size="xs" onClick={open}>
                                Добавить
                            </Button>
                        </div>
                    </Accordion.Panel>
                </div>
            </Accordion.Item>

            <Modal className="Auto" opened={openednewuser} onClose={close}>
                <div>
                    <Text className="black-text">Добавлены:</Text>
                    <Flex wrap="wrap" gap="sm"> {group.users.map((i) => AddUser(i))}</Flex>
                    <br />
                    <Flex wrap="wrap" gap="sm"><Text className="black-text">Не добавлены:</Text></Flex>
                    {notAddedUsers.map((i) => NotAddedUser(i))}
                </div>
            </Modal>
        </div>
    );
};

export default RenderGroup;