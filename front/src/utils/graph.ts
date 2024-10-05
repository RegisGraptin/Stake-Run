import axios from "axios";

export const GRAPHQL_QUERY_GET_CHALLEGES = "query {newChallenges { StakeAndRun_id blockNumber blockTimestamp startTime endTime }}";

// Function to call the graph sub queries
export async function subgraphQuery(query) {
    try {
        // Replace YOUR-SUBGRAPH-URL with the url of your subgraph
        const SUBGRAPH_URL = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT;
        const response = await axios.post(SUBGRAPH_URL, {
            query,
        });
        if (response.data.errors) {
            console.error(response.data.errors);
            throw new Error(`Error making subgraph query ${response.data.errors}`);
        }
        return response.data.data;
    } catch (error) {
        console.error(error);
        throw new Error(`Could not query the subgraph ${error.message}`);
    }
}