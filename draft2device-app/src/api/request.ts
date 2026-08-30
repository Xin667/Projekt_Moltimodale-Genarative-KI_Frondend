import type { CreateProject, GetProjectID, Project, ProjectListResponse } from "./types"
import { useFetch } from "./store"


/// Liste aller Projekte abrufen
export const useListProjects = () => {
  const { commonFetch, isLoading, data } = useFetch<ProjectListResponse>({
    url: "/projects",
    method: "GET",
  });

  const listProjects = () => commonFetch({});

  return { listProjects, isLoading, data };
};



export const useGetProject = () => {
 // adding <Project> after useFetch will give the "data" value the type Project. 
 // This really helps to flesh out the quality of life for the API and is part
 // of creating something that is self documenting. We put Project because we know
 // that is what this endpoint will always return. 
  const { commonFetch, isLoading, data } = useFetch<Project>({
    url: "/projects",
    method: "GET",
  });

  // using typescript to define the input here means no mistakes can be
  // made downstream when actually using our API layer
  const getProject = (input: GetProjectID) => commonFetch({ input });

  return { getProject, isLoading, data };
};

export const useCreateProject = () => {
  const { commonFetch, isLoading, data } = useFetch<Project>({
    url: "/projects",
    method: "POST",
  });

  const createProject = (input: CreateProject ) => commonFetch({ input });

  return { createProject, isLoading, data };
};

export const useDeleteProject = () => {
  const { commonFetch, isLoading } = useFetch<{ message: string }>({
    url: "/projects",
    method: "DELETE",
  });

  const deleteProject = (projectId: string) =>
    commonFetch({ input: { project_id: projectId } });

  return { deleteProject, isLoading };
};
