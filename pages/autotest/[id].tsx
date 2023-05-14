import Answers from "@/components/answer/Answers";
import AutoGPTAPI from "@/utils/api/autogpt/AutoGPTAPI";
import useAiHistory from "@/utils/api/autogpt/hooks/data/useAiHistory";
import useAutoGPTAPI from "@/utils/api/autogpt/hooks/useAutoGPTAPI";
import { addAiHistory } from "@/utils/api/autogpt/redux/data/dataReducer";
import { useRouter } from "next/router";
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from 'uuid';


const Autotest = () => {
  const dispatch = useDispatch()
  const { aiHistoryArray, aiHistory } = useAiHistory()
  const router = useRouter();  // -> Access Next.js Router here
  let { id } = router.query;
  const { fetchData } = useAutoGPTAPI()
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [goal, setGoal] = useState('')
  const [answer, setAnswer] = useState('')
  let currentAi = aiHistory[id as string]



  useEffect(() => {
    const interval = setInterval(async () => {
      if (playing) {
        fetchData()
        currentAi = aiHistory[id as string]
      }
    }, 500)
    return () => clearInterval(interval)
  }, [playing])

  if (!id) {
    return null
  }


  const startScriptLang: (textI: string) => Promise<void> = async (textI: string) => {
    console.log("textI", textI)
    const res = await fetch("/api/agents/agentZapierNLA?  textI=" + textI);
  };

  const startScript: () => Promise<void> = async () => {
    const data: any = {};
    data.ai_name = "Wanda Assistant";
    data.ai_role = "Twitter assistant to improve the content creation process";
    data.goals = [goal];
    data.continuos = false;

    await AutoGPTAPI.createInitData({
      ai_role: data.ai_role,
      ai_name: data.ai_name,
      ai_goals: data.goals,
      continuous: data.continuous,
    })

    dispatch(
      addAiHistory({
        id: id as string,
        agents: [],
        name: data.ai_name,
        role: data.ai_role,
        goals: data.goals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        answers: [],
        continuous: data.continuous,
      }),
    )

    currentAi = aiHistory[id as string]
    await AutoGPTAPI.startScript();

    setPlaying(true);
  };

  const sendScript: () => Promise<void> = async () => {
    AutoGPTAPI.sendData('y')
  }

  return (
    <>

      <span> Welcome to {currentAi === undefined ? 'Wanda Assistant' : currentAi.name} </span>
      <p></p>
      <span> {currentAi === undefined ? 'Wanda Assistant' : currentAi.name} is your personal {currentAi === undefined ? 'Twitter assistant to improve the content creation process' : currentAi.role} </span>
      <p></p>
      <span> What is the goal that you want to achieve today?</span>
      <p></p>
      <input style={{ borderWidth: '2px' }} value={goal} onChange={(e) => setGoal(e.target.value)}></input>
      <p></p>
      <button onClick={startScript}> Start </button>
      <p></p>
      <button onClick={() => startScriptLang(goal)}> Start bu langchain </button>
      <p></p>

      {currentAi &&
        <Answers answers={currentAi.answers} playing={playing} />
      }
      <p></p>

      <input style={{ borderWidth: '2px' }} value={answer} onChange={(e) => setAnswer(e.target.value)}></input>
      <p></p>
      <button onClick={sendScript}> Send </button>
    </>
  )
}

export default Autotest;

