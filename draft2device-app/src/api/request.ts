import { CreateProject, GetProjectID, Project } from "./types"


export const useGetProject = () => {
 // adding <Project> after useFetch will give the "data" value the type Project. 
 // This really helps to flesh out the quality of life for the API and is part
 // of creating something that is self documenting. We put Project because we know
 // that is what this endpoint will always return. 
  const { commonFetch, isLoading, data } = useFetch<Project>({
    url: "http://127.0.0.1:8000/projects",
  });

  // using typescript to define the input here means no mistakes can be
  // made downstream when actually using our API layer
  const getProject = (input: GetProjectID) => commonFetch({ input, method: "GET" });

  return { getProject, isLoading, data };
};

export const useCreateProject = () => {
  const { commonFetch, isLoading, data } = useFetch<Project>({
    url: "http://127.0.0.1:8000/projects",
  });

  const createProject = (input: CreateProject ) => commonFetch({ input, method: "POST" });

  return { createProject, isLoading, data };
};