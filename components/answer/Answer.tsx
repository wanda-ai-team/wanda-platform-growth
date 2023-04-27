import IAnswer, { InternalType } from "@/utils/api/autogpt/redux/types/data/IAnswer"
import { Avatar } from "@chakra-ui/react"
import styled from "styled-components"
import Flex from "../style/Flex"
import colored from "../style/colored"
import Details from "./Details"
import LineSeparatorWithTitle from "./LineSeparatorWithTitle"



const RotatingArrow = styled.div`
  animation: spin 2s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
const ThinkingContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`
export const AnswerContainer = styled.div`
  color: var(--grey100);
  padding: 1rem 2rem;
  border: 1px solid #999;
  border-radius: 0.5rem;
  background-color: var(--grey700);
  width: fit-content;
`

export const SAvatar = styled(Avatar)`
  border: 1px solid var(--primary300);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
`

const Answer = ({
	answer,
	isAnswerLast,
	playing,
}: {
	answer: IAnswer
	isAnswerLast: boolean
	playing: boolean
}) => {
	switch (answer.internalType) {
		case InternalType.THINKING:
			if (isAnswerLast && playing) {
				return (
					<Flex gap={1}>
						<ThinkingContainer>
							<Details $color="grey100">
								<Flex align="center" gap={0.5}>
									<RotatingArrow />
									<div>Thinking</div>
								</Flex>
							</Details>
						</ThinkingContainer>
					</Flex>
				)
			}
			return null
		case InternalType.PLAN:
			return (
				<>
					<LineSeparatorWithTitle title={answer.title} />
					<Flex gap={1}>
						<SAvatar
							src="/images/autoctopus.png"
							sx={{ width: 42, height: 42 }}
						/>
						<AnswerContainer>
							<Flex direction="column" gap={0.5}>
								{answer.content.split("-").map((item, index) => (
									<div key={index}>- {item}</div>
								))}
							</Flex>
						</AnswerContainer>
					</Flex>
				</>
			)

		default:
			return (
				<>
					<LineSeparatorWithTitle title={answer.title} />
					<Flex gap={1}>
						<SAvatar
							src="/images/autoctopus.png"
							sx={{ width: 42, height: 42 }}
						/>
						<AnswerContainer>{answer.content ?? answer.title}</AnswerContainer>
					</Flex>
				</>
			)
	}
}

export default Answer
