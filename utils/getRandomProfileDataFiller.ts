import { generateSimpleUniqueId } from '../utils/generateSimpleUniqueId';

export function getRandomProfileDataFiller() {
  const EXAMPLES: any = [ ];
  console.log('EXAMPLES', EXAMPLES);
  const randomIndex = Math.floor(Math.random() * EXAMPLES.length);
  const randomExample = EXAMPLES[randomIndex];
  return {
    uid: generateSimpleUniqueId(),
    name: randomExample.ai_name,
    role: randomExample.ai_role,
    goals: [randomExample.ai_goal],
  };
}
