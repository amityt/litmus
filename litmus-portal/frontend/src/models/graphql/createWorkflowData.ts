export interface WeightMap {
  experiment_name: string;
  weightage: number;
}
export interface CreateWorkFlowInput {
  ChaosWorkFlowInput: {
    workflow_id?: string;
    workflow_manifest: string;
    cronSyntax: string;
    workflow_name: string;
    workflow_description: string;
    isCustomWorkflow: boolean;
    weightages: WeightMap[];
    project_id: string;
    cluster_id: string;
  };
}

export interface CreateWorkflowResponse {
  cluster_id: string;
  is_active: boolean;
}

export interface UpdateWorkflowResponse {
  workflow_id: string;
  workflow_name: string;
  workflow_description: string;
  isCustomWorkflow: string;
  cronSyntax: string;
}
