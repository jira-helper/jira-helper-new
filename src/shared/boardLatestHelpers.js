import { intersection } from 'lodash';

export const getColumnById = (boardLatest, columnId) => {
    return boardLatest?.columns?.find(column => {
        return String(column?.id) === String(columnId);
    });
};

export const getSwimlaneById = (boardLatest, swimlaneId) => {
    return boardLatest?.swimlaneInfo?.swimlanes?.find(swimlane => {
        return String(swimlane?.id) === String(swimlaneId);
    });
};

export const getIssueIdsByColumnId = (boardLatest, columnId) => {
    const column = getColumnById(boardLatest, columnId);
    return column?.issues?.map(issue => {
        return issue?.id;
    }) ?? [];
};

export const getIssueIdsBySwimlaneId = (boardLatest, swimlaneId) => {
    const swimlane = getSwimlaneById(boardLatest, swimlaneId);
    return swimlane?.issueIds ?? [];
};

export const getIssueIdsBySwimlaneIdAndColumnId = (boardLatest, swimlaneId, columnId) => {
    const swimlaneIds = getIssueIdsBySwimlaneId(boardLatest, swimlaneId);
    const columnIds = getIssueIdsByColumnId(boardLatest, columnId);

    return intersection(swimlaneIds, columnIds);
};
