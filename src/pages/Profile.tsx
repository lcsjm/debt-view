import { useEffect, useState } from "react";
import supabase from "utils/supabase";
import { useAuth } from "../context/AuthContext";

export type Profile = {
    name?: string,
    cpf?: string,
    birth?: string,
    cep?: string,
    gender?: string,
    race?: string,
}

export default function Profile (){
    const {user, signOutUser} = useAuth();
// Variável que recebe um tipo própio é um objeto
    const [prof, setProf] = useState<Profile>({});

    useEffect(() => {
       if (user) syncProfile(user.id);
    }, []);

    function syncProfile(user_id: string){
        const {data, error} = supabase.from('profiles').select('*').eq("user_id", user_id).single();

        if (error){
            alert(error.message)
            return
        }
        //order('created at', {ascending: false})

    }

    async function handleProfile(){
        const data = {...prof, user_id: user?.id}
        const {error} = await supabase.from('profiles').insert(data);

        if (error){
            alert(error.message);
            return
        }

        alert ('Cadastrado com sucesso')
    }

    return (
        <>
            <input 
                type="text"
                placeholder="Digite seu nome."
                value={prof.name}
                onChange={(e) => setProf({...prof, name: e.target.value})}/>

                <input 
                type="text"
                placeholder="Digite seu CPF."
                value={prof.cpf}
                onChange={(e) => setProf({...prof, cpf: e.target.value})}/>
      

                
            <input 
                type="date"
                placeholder="Digite o dia em que você nasceu."
                value={prof.birth}
                onChange={(e) => setProf({...prof, birth: e.target.value})}/>
   

                
            <input 
                type="text"
                placeholder="Digite seu CEP"
                value={prof.cep}
                onChange={(e) => setProf({...prof, cep: e.target.value})}/>
      

                
            <input 
                type="text"
                placeholder="Digite seu gênero"
                value={prof.gender}
                onChange={(e) => setProf({...prof, gender: e.target.value})}/>
      

                
            <input 
                type="text"
                placeholder="Digite sua cor/raça"
                value={prof.race}
                onChange={(e) => setProf({...prof, race: e.target.value})}/>
            
            < button onClick={handleProfile}>Cadastrar</button>
        </>
    )
}
