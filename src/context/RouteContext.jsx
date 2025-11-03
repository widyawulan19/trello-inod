import React, { createContext, useContext, useState } from 'react'

const RouteContext = createContext();

export const RouteProvider=({children})=> {
    const [workspaceId, setWorkspaceId] = useState(null);
    const [boardId, setBoardId] = useState(null)

  return (
    <RouteContext.Provider value={{workspaceId, setWorkspaceId, boardId, setBoardId}}>
        {children}
    </RouteContext.Provider>
  )
}

export const useRouterContext = () => useContext(RouteContext);
// export default RouteContext