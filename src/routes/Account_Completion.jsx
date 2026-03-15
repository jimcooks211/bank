import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import '../App.css'


const Account_Completion = ({closeCompletion}) => {

    return (
        <div>
            <div className="account-completion-header">
            <ArrowLeftIcon width={20} onClick={closeCompletion}/>
            </div>
        </div>
    )
}   
export default Account_Completion;