
import styled from "styled-components"
import Answer from "./Answer"
import IAnswer from "@/utils/api/autogpt/redux/types/data/IAnswer"

export const AnswerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: 1rem;
`

const Answers = ({
	answers,
	playing,
}: {
	answers: IAnswer[]
	playing: boolean
}) => {
	if (!answers) return null
	if (!Array.isArray(answers)) return null
	console.log("answers")
	console.log(answers)
	return (
		<AnswerContainer>
			{answers.map((answer, index) => (
				answer !== null && answer.content !== '' &&
				<Answer
					answer={answer}
					key={answer.title}
					isAnswerLast={index === answers.length - 1}
					playing={playing}
				/>
			))}
		</AnswerContainer>
	)
}

export default Answers
