import { useDispatch } from "react-redux"
import AutoGPTAPI from "../AutoGPTAPI"
import IAnswer from "../redux/types/data/IAnswer"
import { addAnswersToAi } from "../redux/data/dataReducer"
import { useParams } from "react-router"
import useAnswerInterceptor from "./useAnswerInterceptor"
import { useRouter } from "next/router"

const useAutoGPTAPI = () => {
	const dispatch = useDispatch()
	const router = useRouter();  // -> Access Next.js Router here
	const { id } = router.query;
	const { interceptAnswer } = useAnswerInterceptor()

	const fetchData = async () => {
		if (!id) return
		let data = (await AutoGPTAPI.fetchData()) as Array<IAnswer>
		if (data.length === 0) return
		data = interceptAnswer(data)
		console.log("data")
		console.log(data)
		dispatch(
			addAnswersToAi({
				aiId: id as string,
				answers: data,
			}),
		)
	}

	return {
		fetchData,
	}
}

export default useAutoGPTAPI
