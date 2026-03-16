import {useState, useRef} from 'react';

interface ToastProp {
    message: string;
}

export function Toast({message}: ToastProp){
    if(!message) return null;

    return (
        <div className='toast'>
            <p id="toast">{ message }</p>
        </div>
    );
}

export function useToast(){
    const [message, setMessage] = useState("");
    const timeOutRef = useRef<number | null>(null);

    function showToast(msg: string, duration = 5000){
        setMessage(msg);

        if(timeOutRef.current){
            window.clearTimeout(timeOutRef.current);
        }

        setTimeout( () => {
            setMessage('');
            timeOutRef.current = null;
        } , duration);
    }

    return {
        message,
        showToast
    }
}