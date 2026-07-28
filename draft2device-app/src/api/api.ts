import { useGetProject, useCreateProject } from "./request";

export const useProjectApi = () => {
  const {
    getProject,
    isLoading: getProjectLoading,
    data: getProjectData,
  } = useGetProject();

  const {
    createProject,
    isLoading: createProjectLoading,
    data: createProjectData,
  } = useCreateProject();

  return {
    getProject: {
      query: getProject,
      isLoading: getProjectLoading,
      data: getProjectData,
    },
    createProject: {
      mutation: createProject,
      isLoading: createProjectLoading,
      data: createProjectData,
    },
  };
};