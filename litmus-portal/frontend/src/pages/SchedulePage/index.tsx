import { useMutation, useQuery } from '@apollo/client';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useParams } from 'react-router-dom';
import Unimodal from '../../containers/layouts/Unimodal';
import { SCHEDULE_DETAILS, UPDATE_SCHEDULE } from '../../graphql';
import {
  CreateWorkFlowInput,
  UpdateWorkflowResponse,
  WeightMap,
} from '../../models/graphql/createWorkflowData';
import { experimentMap, WorkflowData } from '../../models/redux/workflow';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as WorkflowActions from '../../redux/actions/workflow';
import * as TemplateSelectionActions from '../../redux/actions/template';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import parsed from '../../utils/yamlUtils';
import ChooseWorkflow from '../../views/CreateWorkflow/ChooseWorkflow/index';
import ReliablityScore from '../../views/CreateWorkflow/ReliabilityScore';
import ScheduleWorkflow from '../../views/CreateWorkflow/ScheduleWorkflow';
import TuneWorkflow from '../../views/CreateWorkflow/TuneWorkflow/index';
import VerifyCommit from '../../views/CreateWorkflow/VerifyCommit';
import ChooseAWorkflowCluster from '../../views/CreateWorkflow/WorkflowCluster';
import Scaffold from '../../containers/layouts/Scaffold';
import useQontoStepIconStyles from '../../components/WorkflowStepper/useQontoStepIconStyles';
import useStyles from '../../components/WorkflowStepper/styles';
import ButtonFilled from '../../components/Button/ButtonFilled';
import QontoConnector from '../../components/WorkflowStepper/quontoConnector';
import ButtonOutline from '../../components/Button/ButtonOutline';
import { ScheduleDataVars, Schedules } from '../../models/graphql/scheduleData';
import Loader from '../../components/Loader';
import { cronWorkflow, workflowOnce } from './template';

interface URLParams {
  workflowName: string;
  projectId: string;
}

interface Weights {
  experimentName: string;
  weight: number;
}

function getSteps(): string[] {
  return [
    'Target Cluster',
    'Choose a workflow',
    'Tune workflow',
    'Reliability score',
    'Schedule',
    'Verify and Commit',
  ];
}

function QontoStepIcon(props: StepIconProps) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  if (completed) {
    return (
      <div
        className={`${classes.root} ${
          active ? classes.active : classes.completed
        }`}
      >
        <img src="/icons/NotPass.png" alt="Not Completed Icon" />
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={`${classes.root} ${
          active ? classes.active : classes.completed
        }`}
      >
        <div className={classes.circle} />
      </div>
    );
  }

  return (
    <div
      className={`${classes.root} ${
        active ? classes.active : classes.completed
      }`}
    >
      {/* <img src="./icons/workflowNotActive.svg" /> */}
      <div className={classes.outerCircle}>
        <div className={classes.innerCircle} />
      </div>
    </div>
  );
}

function getStepContent(
  stepIndex: number,
  gotoStep: (page: number) => void
): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return (
        <ChooseAWorkflowCluster gotoStep={(page: number) => gotoStep(page)} />
      );
    case 1:
      return <ChooseWorkflow isEditable={false} />;
    case 2:
      return <TuneWorkflow />;
    case 3:
      return <ReliablityScore />;
    case 4:
      return <ScheduleWorkflow />;
    case 5:
      return (
        <VerifyCommit
          isEditable={false}
          gotoStep={(page: number) => gotoStep(page)}
        />
      );
    default:
      return (
        <ChooseAWorkflowCluster gotoStep={(page: number) => gotoStep(page)} />
      );
  }
}

const EditScheduledWorkflow = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const template = useActions(TemplateSelectionActions);
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const workflow = useActions(WorkflowActions);
  // Get Parameters from URL
  const paramData: URLParams = useParams();
  // Apollo query to get the scheduled data
  const { data, loading } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID: paramData.projectId },
      fetchPolicy: 'cache-and-network',
    }
  );
  const wfDetails =
    data &&
    data.getScheduledWorkflows.filter(
      (wf) => wf.workflow_name === paramData.workflowName
    )[0];
  const doc = new YAML.Document();
  const a: Weights[] = [];
  useEffect(() => {
    if (wfDetails !== undefined) {
      for (let i = 0; i < wfDetails?.weightages.length; i++) {
        a.push({
          experimentName: wfDetails?.weightages[i].experiment_name,
          weight: wfDetails?.weightages[i].weightage,
        });
      }
      doc.contents = JSON.parse(wfDetails?.workflow_manifest);
      workflow.setWorkflowDetails({
        workflow_id: wfDetails?.workflow_id,
        name: wfDetails?.workflow_name,
        yaml: doc.toString(),
        id: 0,
        description: wfDetails?.workflow_description,
        weights: a,
        isCustomWorkflow: wfDetails?.isCustomWorkflow,
        clusterid: wfDetails?.cluster_id,
        cronSyntax: wfDetails?.cronSyntax,
        scheduleType: {
          scheduleOnce:
            wfDetails?.cronSyntax === '' ? 'now' : 'recurringSchedule',
          recurringSchedule: '',
        },
        scheduleInput: {
          hour_interval: 0,
          day: 1,
          weekday: 'Monday',
          time: new Date(),
          date: new Date(),
        },
      });
    }
    template.selectTemplate({ selectTemplateID: 0, isDisable: false });
  }, [data]);

  const {
    yaml,
    weights,
    description,
    isCustomWorkflow,
    cronSyntax,
    name,
    clusterid,
    scheduleType,
  } = workflowData;

  const [activeStep, setActiveStep] = React.useState(2);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const isDisable = useSelector(
    (state: RootState) => state.selectTemplate.isDisable
  );
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const tabs = useActions(TabActions);
  const scheduleOnce = workflowOnce;
  const scheduleMore = cronWorkflow;
  const [invalidYaml, setinValidYaml] = React.useState(false);
  const steps = getSteps();

  function EditYaml() {
    const oldParsedYaml = YAML.parse(yaml);
    const NewLink: string = ' ';
    let NewYaml: string = ' ';
    if (
      oldParsedYaml.kind === 'Workflow' &&
      scheduleType.scheduleOnce !== 'now'
    ) {
      const oldParsedYaml = YAML.parse(yaml);
      const newParsedYaml = YAML.parse(scheduleMore);
      delete newParsedYaml.spec.workflowSpec;
      newParsedYaml.spec.schedule = cronSyntax;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.metadata.labels = {
        workflow_id: workflowData.workflow_id,
      };
      newParsedYaml.spec.workflowSpec = oldParsedYaml.spec;
      const tz = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(tz).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      scheduleType.scheduleOnce === 'now'
    ) {
      const oldParsedYaml = YAML.parse(yaml);
      const newParsedYaml = YAML.parse(scheduleOnce);
      delete newParsedYaml.spec;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.spec = oldParsedYaml.spec.workflowSpec;
      newParsedYaml.metadata.labels = {
        workflow_id: workflowData.workflow_id,
      };
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      scheduleType.scheduleOnce !== 'now'
    ) {
      const newParsedYaml = YAML.parse(yaml);
      newParsedYaml.spec.schedule = cronSyntax;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.metadata.labels = { workflow_id: workflowData.workflow_id };
      const tz = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(tz).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
  }

  const handleNext = () => {
    if (activeStep === 2) {
      const tests = parsed(yaml);
      const arr: experimentMap[] = [];
      const hashMap = new Map();
      weights.forEach((weight) => {
        hashMap.set(weight.experimentName, weight.weight);
      });
      tests.forEach((test) => {
        let value = 10;
        if (hashMap.has(test)) {
          value = hashMap.get(test);
        }
        arr.push({ experimentName: test, weight: value });
      });
      workflow.setWorkflowDetails({
        weights: arr,
      });
      if (arr.length === 0) {
        setinValidYaml(true);
      } else {
        setinValidYaml(false);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else if (activeStep === 4) {
      EditYaml();
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleBack = () => {
    if (activeStep === 2) {
      setinValidYaml(false);
    } else if (activeStep === 4 && isDisable === true) {
      template.selectTemplate({ isDisable: false });
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [createChaosWorkFlow] = useMutation<
    UpdateWorkflowResponse,
    CreateWorkFlowInput
  >(UPDATE_SCHEDULE, {
    onCompleted: () => {
      setOpen(true);
    },
  });

  const handleMutation = () => {
    if (name.length !== 0 && description.length !== 0 && weights.length !== 0) {
      const weightData: WeightMap[] = [];

      weights.forEach((data) => {
        weightData.push({
          experiment_name: data.experimentName,
          weightage: data.weight,
        });
      });

      /* JSON.stringify takes 3 parameters [object to be converted,
      a function to alter the conversion, spaces to be shown in final result for indentation ] */
      const yml = YAML.parse(yaml);
      const yamlJson = JSON.stringify(yml, null, 2); // Converted to Stringified JSON

      const chaosWorkFlowInputs = {
        workflow_id: wfDetails?.workflow_id,
        workflow_manifest: yamlJson,
        cronSyntax,
        workflow_name: name,
        workflow_description: description,
        isCustomWorkflow,
        weightages: weightData,
        project_id: selectedProjectID,
        cluster_id: clusterid,
      };
      createChaosWorkFlow({
        variables: { ChaosWorkFlowInput: chaosWorkFlowInputs },
      });
    }
  };

  const handleOpen = () => {
    handleMutation();
    setOpen(true);
  };

  const handleClose = () => {
    history.push('/workflows');
    setOpen(false);
  };

  function gotoStep({ page }: { page: number }) {
    setActiveStep(page);
  }

  // Check correct permissions for user
  if (userRole === 'Viewer')
    return (
      <>
        <Typography
          variant="h3"
          align="center"
          style={{ marginTop: '10rem', marginBottom: '3rem' }}
        >
          Missing sufficient permissions :(
        </Typography>
        <Typography variant="h6" align="center">
          Looks like you do not have the required permission to create a new
          workflow on this project.
        </Typography>
        <br />
        <Typography variant="body1" align="center">
          Contact portal administrator to upgrade your permission.
        </Typography>

        {/* Back Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
          }}
        >
          <ButtonFilled isPrimary handleClick={() => history.goBack()}>
            Go Back
          </ButtonFilled>
        </div>
      </>
    );

  return (
    <Scaffold>
      {loading ? (
        <Loader />
      ) : (
        <div className={classes.root}>
          <Stepper
            activeStep={activeStep}
            connector={<QontoConnector />}
            className={classes.stepper}
            alternativeLabel
          >
            {steps.map((label, i) => (
              <Step key={label}>
                {activeStep === i ? (
                  <StepLabel StepIconComponent={QontoStepIcon}>
                    <div className={classes.activeLabel} data-cy="labelText">
                      {label}
                    </div>
                  </StepLabel>
                ) : (
                  <StepLabel StepIconComponent={QontoStepIcon}>
                    <div className={classes.normalLabel} data-cy="labelText">
                      {label}
                    </div>
                  </StepLabel>
                )}
              </Step>
            ))}
          </Stepper>
          <div>
            <div>
              <div>
                <Unimodal
                  open={open}
                  handleClose={handleClose}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                  hasCloseBtn
                >
                  <div>
                    <img
                      src="/icons/finish.svg"
                      className={classes.mark}
                      alt="mark"
                    />
                    <div className={classes.heading}>
                      Chaos workflow,
                      <br />
                      <strong>was successfully updated!</strong>
                    </div>
                    <div className={classes.headWorkflow}>
                      Chaos workflow updated successfully! Now information about{' '}
                      <br /> it will be displayed on the main screen of the
                      application.
                    </div>
                    <div className={classes.button}>
                      <ButtonFilled
                        isPrimary
                        data-cy="selectFinish"
                        handleClick={() => {
                          setOpen(false);
                          tabs.changeWorkflowsTabs(0);
                          history.push('/workflows');
                        }}
                      >
                        <div>Back to workflow</div>
                      </ButtonFilled>
                    </div>
                  </div>
                </Unimodal>
                {getStepContent(activeStep, (page: number) =>
                  gotoStep({ page })
                )}
              </div>
              {/* Control Buttons */}

              <div className={classes.buttonGroup}>
                {activeStep !== 1 ? (
                  <ButtonOutline isDisabled={false} handleClick={handleBack}>
                    <Typography>Back</Typography>
                  </ButtonOutline>
                ) : null}
                {activeStep === steps.length - 1 ? (
                  <ButtonFilled handleClick={handleOpen} isPrimary>
                    <div>Finish</div>
                  </ButtonFilled>
                ) : (
                  <ButtonFilled
                    handleClick={() => handleNext()}
                    isPrimary
                    isDisabled={isDisable}
                  >
                    <div>
                      Next
                      <img
                        alt="next"
                        src="/icons/nextArrow.svg"
                        className={classes.nextArrow}
                      />
                    </div>
                  </ButtonFilled>
                )}
                {invalidYaml ? (
                  <Typography className={classes.yamlError}>
                    <strong>{t('workflowStepper.continueError')}</strong>
                  </Typography>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </Scaffold>
  );
};

export default EditScheduledWorkflow;
