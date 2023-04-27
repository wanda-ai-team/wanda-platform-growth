
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import IAgent from '../../redux/types/data/IAgent';

const useAgents: () => {
    agents: RootState["data"]["agents"];
    agentsArray: Array<IAgent>;
} = () => {
    const agents = useSelector((state: RootState) => state.data.agents)

    return { agents, agentsArray: Object.values(agents) };
}

export default useAgents;