import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Text, Button, Center, TextInput, PasswordInput, Grid } from '@mantine/core'
import axios, {AxiosError} from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const [opened, { open, close }] = useDisclosure(false);
    const [AutoReg, setAutoReg] = useState(["Авторизация", "Ещё нет аккаунта? Зарегистрируйся!"])
    const [newUser, setNewUser] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [err, setErr] = useState<{username: string; password: string}>({ username: '', password: '' })
    const navigate = useNavigate();

    const Change = () => {
        if (AutoReg[0] === "Авторизация") {
            setAutoReg(["Регистрация", "Уже есть аккаунт? Авторизируйся!"])
        }
        else {
            if (AutoReg[0] === "Регистрация") {
                setAutoReg(["Авторизация", "Ещё нет аккаунта? Зарегистрируйся!"])
            }
        }
    }

    const Registr = async () => {
        try {
            const response = await axios.post("http://localhost:3000/users",newUser)
            localStorage.setItem("user", JSON.stringify(response.data))
            navigate("/profile")
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error creating user:', axiosError.response ? axiosError.response.data : axiosError.message);
        }
    }

    const Autoris = async () =>{
        try{
            const response = await axios.get(`http://localhost:3000/users/${newUser.username}`)
            setErr({...err, password:"", username: ""})
            if(response.data.password != newUser.password){
                setErr({...err, password: "Неверный пароль"})
            }
            else if(newUser.password === response.data.password){
                localStorage.setItem("user", JSON.stringify(response.data))
                navigate("/profile")
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error creating user:', axiosError.response ? axiosError.response.data : axiosError.message);
            setErr({...err, username: "Неверный логин"})
          }
    }

    const handleClick = () =>{
        if(AutoReg[0] === "Авторизация"){
            Autoris()
        }
        else{
            if(AutoReg[0] === "Регистрация") {
                Registr()
            }
        }
    }


    return (
        <div>
            <Text className='MainText'>TaskMaster</Text>
            <hr />
            <Text className='Description'>
                <Text className='one'>TaskMaster - это многостраничный веб-сайт, который позволяет пользователям эффективно управлять своими задачами.</Text>
                <Text className='two'>Сайт поддерживает создание личных и групповых задач, назначение задач участникам группы</Text>
                <Text className='three'>установку сроков выполнения и приоритетов, а также отслеживание прогресса выполнения задач.</Text>
            </Text>

            <Modal className='Auto' opened={opened} onClose={close} title={AutoReg[0]} >
                <div>
                    <TextInput error={err.username} onChange={(Event) => setNewUser({ ...newUser, username: Event.target.value })} radius="xl" label="Введите логин"></TextInput>
                    <PasswordInput error={err.password} onChange={(Event) => setNewUser({...newUser, password: Event.target.value})} radius="xl" label="Введите пароль"></PasswordInput>
                    <Grid className='RegAndAutoButtons' grow>
                        <Grid.Col span={2}><Button variant="white" onClick={() => Change()} ><Text className='RegBut'><div className='black-text'>{AutoReg[1]}</div></Text></Button></Grid.Col>
                        <Grid.Col span={2}><Button justify='center' onClick={() => handleClick()} radius="xl"><Text className='RegAndAutoButton'>{AutoReg[0]}</Text></Button></Grid.Col>
                    </Grid>

                </div>
            </Modal>


            <Center className='ButtonReg'>
                <Button className='ButtonReg' onClick={open} variant="gradient"
                    gradient={{ from: 'rgba(60, 70, 117, 1)', to: 'rgba(84, 84, 84, 1)', deg: 90 }} size="md" radius="xl"> Зарегистрируйтесь! </Button>
            </Center>

        </div>
    )
}

export default Home