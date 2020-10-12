import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TableCell,
  Typography,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import React from 'react';
import cronstrue from 'cronstrue';
import YAML from 'yaml';
import { ScheduleWorkflow } from '../../../models/graphql/scheduleData';
import useStyles from './styles';
import ExperimentPoints from './ExperimentPoints';
import { history } from '../../../redux/configureStore';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { getWeekDayName, setScheduleType } from './scheduleTypeUtils';

interface TableDataProps {
  data: ScheduleWorkflow;
  deleteRow: (wfid: string) => void;
}

interface Weights {
  experimentName: string;
  weight: number;
}
const TableData: React.FC<TableDataProps> = ({ data, deleteRow }) => {
  const classes = useStyles();
  // States for PopOver to display Experiment Weights
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const open = Boolean(anchorEl);
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };

  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    if (date) return resDate;
    return 'Date not available';
  };

  const workflow = useActions(WorkflowActions);

  const editSchedule = () => {
    const doc = new YAML.Document();
    const a: Weights[] = [];
    for (let i = 0; i < data.weightages.length; i++) {
      a.push({
        experimentName: data.weightages[i].experiment_name,
        weight: data.weightages[i].weightage,
      });
    }
    doc.contents = JSON.parse(data.workflow_manifest);
    const cron = data.cronSyntax.split(' ');
    const minutes = cron[0];
    const hours = cron[1];
    const dayOfMonth = cron[2];
    const month = cron[3];
    const dayOfWeek = cron[4];
    workflow.setWorkflowDetails({
      name: data.workflow_name,
      yaml: doc.toString(),
      id: 0,
      description: data.workflow_description,
      weights: a,
      isCustomWorkflow: data.isCustomWorkflow,
      clusterid: data.cluster_id,
      cronSyntax: data.cronSyntax,
      scheduleType: {
        scheduleOnce: data.cronSyntax === '' ? 'now' : 'recurringSchedule',
        recurringSchedule:
          data.cronSyntax === ''
            ? ''
            : setScheduleType(dayOfMonth, month, dayOfWeek),
      },
      scheduleInput: {
        hour_interval:
          minutes !== '*' && minutes !== '' ? parseInt(minutes, 10) : 0,
        day:
          dayOfMonth !== '*' && dayOfMonth !== undefined
            ? parseInt(dayOfMonth, 10)
            : 1,
        weekday: getWeekDayName(dayOfWeek),
        time:
          hours !== '*' &&
          minutes !== '*' &&
          hours !== undefined &&
          minutes !== undefined
            ? new Date(
                new Date().setHours(parseInt(hours, 10), parseInt(minutes, 10))
              )
            : new Date(),
        date: new Date(),
      },
      updatingSchedule: true,
    });
    history.push(`/workflows/schedule/${data.workflow_id}`);
  };

  return (
    <>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterStartDate}>
          {formatDate(data.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.regularityData}>
          <div className={classes.expDiv}>
            <img src="/icons/calender.svg" alt="Calender" />
            <Typography style={{ paddingLeft: 10 }}>
              {data.cronSyntax === ''
                ? 'Once'
                : cronstrue.toString(data.cronSyntax)}
            </Typography>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Typography>{data.cluster_name}</Typography>
      </TableCell>
      <TableCell>
        <Button onClick={handlePopOverClick} style={{ textTransform: 'none' }}>
          {isOpen ? (
            <div className={classes.expDiv}>
              <Typography className={classes.expInfoActive}>
                <strong>Show Experiment</strong>
              </Typography>
              <KeyboardArrowDownIcon className={classes.expInfoActiveIcon} />
            </div>
          ) : (
            <div className={classes.expDiv}>
              <Typography className={classes.expInfo}>
                <strong>Show Experiment</strong>
              </Typography>
              <ChevronRightIcon />
            </div>
          )}
        </Button>
        <Popover
          id={id}
          open={isOpen}
          anchorEl={popAnchorEl}
          onClose={handlePopOverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          style={{
            marginTop: 10,
          }}
        >
          <div className={classes.weightDiv}>
            {data.weightages.map((expData) => {
              return (
                <div style={{ marginBottom: 8 }}>
                  <ExperimentPoints
                    expName={expData.experiment_name}
                    weight={expData.weightage}
                  />
                </div>
              );
            })}
          </div>
        </Popover>
      </TableCell>
      <TableCell className={classes.menuCell}>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={classes.optionBtn}
          data-cy="browseScheduleOptions"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          <MenuItem value="Analysis" onClick={() => editSchedule()}>
            <div className={classes.expDiv}>
              <img
                src="/icons/edit.svg"
                alt="Edit Schedule"
                className={classes.btnImg}
              />
              <Typography data-cy="editSchedule" className={classes.btnText}>
                Edit Schedule
              </Typography>
            </div>
          </MenuItem>
          <MenuItem
            value="Analysis"
            onClick={() => deleteRow(data.workflow_id)}
          >
            <div className={classes.expDiv}>
              <img
                src="/icons/deleteSchedule.svg"
                alt="Delete Schedule"
                className={classes.btnImg}
              />
              <Typography data-cy="deleteSchedule" className={classes.btnText}>
                Delete Schedule
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
