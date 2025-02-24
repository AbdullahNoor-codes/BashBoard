import { useState, useEffect } from "react";
import axios from "axios";
import ProjectForm from "@/components/features/Objectives/ProjectForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProjectNavBar = ({ userId, selectedProjectId, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/projects/user/${userId}`);
        setProjects(data);

        const storedProjectId = localStorage.getItem("selectedProjectId");
        const defaultProject = data.find((p) => p.project_name === "General Project") || data[0];

        const projectToSelect = storedProjectId && data.some((p) => p.project_id === storedProjectId)
          ? storedProjectId
          : defaultProject?.project_id;

        if (projectToSelect) handleProjectSelect(projectToSelect);
      } catch {
        toast.error("Failed to fetch projects");
      }
    };

    if (userId) fetchProjects();
  }, [userId]);

  const handleProjectSelect = (projectId) => {
    onSelectProject(projectId);
    localStorage.setItem("selectedProjectId", projectId); // Persist project selection
  };

  const handleAddProject = async ({ project_name, user_id }) => {
    try {
      const { data: newProject } = await axios.post("http://localhost:3000/projects", {
        project_name,
        user_id,
      });

      setProjects((prev) => [...prev, newProject]);
      handleProjectSelect(newProject.project_id);  // Select the new project immediately
      setIsAddingProject(false);
      toast.success("Project created successfully");
    } catch (err) {
      console.error("Project creation error:", err.message);
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="bg-gray-100 shadow-sm py-2 px-4 flex items-center space-x-4 overflow-x-auto w-full">
      {projects.map((project) => (
        <Button
          key={project.project_id}
          onClick={() => handleProjectSelect(project.project_id)}
          variant={project.project_id === selectedProjectId ? "default" : "outline"}
        >
          {project.project_name}
        </Button>
      ))}
      <Button variant="outline" onClick={() => setIsAddingProject(true)}>
        + Add Project
      </Button>
      {isAddingProject && (
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setIsAddingProject(false)}
        />
      )}
    </div>
  );
};

export default ProjectNavBar;
