import { Accordion, Checkbox, Text, Button } from "@mantine/core";

export class Task {
    id: number;
    name: string;
    description: string;
    status: boolean;
    userid: number;
    deadline: Date;

    constructor(id: number, name: string, description: string, status: boolean, userid: number, deadline: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.userid = userid;
        this.deadline = deadline;
    }

    render(newProgress: (id: number, isChecked: boolean) => void, onDelete: (id: number) => void) {
        return (
            <Accordion.Item className="AccItem" key={this.id} value={this.id.toString()}>
                <Checkbox className="CheckBox"
                    checked={this.status || false}
                    onChange={() => newProgress(this.id, !this.status)}
                />
                <div>
                    <Accordion.Control>
                        <div className="Task">
                            <Text>{this.name}</Text>
                        </div>
                    </Accordion.Control>
                    <Accordion.Panel className="AccPanel">
                        <div>Описание: {this.description}</div>
                        <div>Дедлайн: {this.deadline.toLocaleString()}</div>
                        <Button variant="outline"
                            color="red"
                            size="xs"
                            onClick={() => { onDelete(this.id); }}>Удалить</Button>
                    </Accordion.Panel>
                </div>
            </Accordion.Item>
        );
    }
}

export interface grouptask {
    idtask: number
    name: string
    description: string
    status: boolean
    deadlinedate: Date
    idgroup: number

}

interface user {
    id: number
    username: string
}

export interface Group {
    id: number
    name: string
    users: user[]
    grouptask: grouptask[]
}

export const rendertask = (task: grouptask, onProgressChange: (id: number, isChecked: boolean) => void, onDelete: (taskId: number) => void) => {
    return (
        <Accordion.Item className="AccItem" key={task.idtask} value={task.idtask.toString()}>
            <Checkbox className="CheckBox"
                checked={task.status}
                onChange={(event) => onProgressChange(task.idtask, event.currentTarget.checked)}
            />
            <div>
                <Accordion.Control>
                    <div className="Task">
                        <Text>{task.name}</Text>
                    </div>
                </Accordion.Control>
                <Accordion.Panel className="AccPanel">
                    <Text>{task.description}</Text>
                    <Text>Deadline: {task.deadlinedate.toLocaleString()}</Text>
                    <Button variant="outline"
                        color="red"
                        size="xs" onClick={() => onDelete(task.idtask)}>
                        Удалить
                    </Button>
                </Accordion.Panel>
            </div>
        </Accordion.Item>
    );
};
