import { fade, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(4, 2),
    margin: '0 auto',
    width: '88%',
    height: '100%',
    flexDirection: 'column',
    [theme.breakpoints.up('lg')]: {
      width: '87%',
    },
  },

  // Inner Container
  innerContainer: {
    margin: theme.spacing(4, 'auto'),
    width: '95%', // Inner width of the container
  },

  // Header Div
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
  },
  subtitle: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.up('lg')]: {
      fontSize: '1rem',
      margin: theme.spacing(4, 0),
    },
  },

  // Divider
  divider: {
    border: 'none',
    backgroundColor: theme.palette.disabledBackground,
    height: '0.1rem',
  },

  // Selection Radio Buttons
  m5: {
    marginTop: theme.spacing(5),
  },
  accordion: {
    border: 'none',
    boxShadow: 'none',
    '& .MuiAccordionSummary-root': {
      marginLeft: '-1rem',
      border: 'none',
      height: '0.5rem',
    },

    '& .MuiAccordionDetails-root': {
      position: 'relative',
      marginLeft: '-1rem',
      border: 'none',
    },
    '& .MuiAccordion-root:before': {
      backgroundColor: 'transparent',
    },
  },

  // Accordion Expanded Body [Content]
  predefinedWorkflowDiv: {
    height: window.screen.height < 1080 ? '15rem' : '20rem',
    overflowY: 'scroll',
  },
  predefinedWorkflowCard: {
    backgroundColor: theme.palette.cards.background,
    lineHeight: '5rem', // Making the div content vertically aligned
    padding: theme.spacing(0, 5),
    margin: theme.spacing(1, 0),

    '& #body': {
      width: '40rem',
      display: 'flex',
      justifyContent: 'space-between',
    },

    '& #left-div': {
      width: '15rem',
      display: 'flex',
      marginLeft: theme.spacing(2),
    },

    '& #right-div': {
      width: '20rem',
      display: 'flex',
    },
  },
  experimentIcon: {
    width: '3rem',
    height: '3rem',
  },
  predefinedWorkflowName: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
  blur: {
    height: '4rem',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    background: theme.palette.background.paper,
    opacity: '0.8',
    filter: 'blur(1rem)',
  },

  // Upload button styles
  uploadYAMLDiv: {
    width: '95%',
    padding: theme.spacing(3.75),
    border: `1px dashed ${theme.palette.border.main}`,
    margin: 'auto',
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(1.25),
    backgroundColor: theme.palette.background.paper,
  },
  uploadYAMLText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '31.25rem',
    margin: 'auto',
    paddingTop: theme.spacing(1),
  },
  uploadImage: {
    marginBottom: theme.spacing(2.5),
  },
  orText: {
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25),
  },
  uploadBtn: {
    textTransform: 'none',
    width: 'fit-content',
    fontSize: '0.7rem',
    height: '2.8125rem',
    border: `2px solid ${theme.palette.primary.light}`,
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      borderColor: (props) =>
        props !== true ? theme.palette.primary.light : '',
      boxShadow: (props) =>
        props !== true
          ? `${fade(theme.palette.primary.light, 0.5)} 0 0.3rem 0.4rem 0`
          : 'none',
    },
  },
  uploadSuccessDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '31.25rem',
    margin: '0 auto',
    paddingTop: theme.spacing(1.875),
  },
  uploadSuccessImg: {
    width: '3.125rem',
    height: '3.125rem',
    verticalAlign: 'middle',
    paddingBottom: theme.spacing(1),
  },
  uploadSuccessText: {
    display: 'inline-block',
    fontSize: '1rem',
    marginBottom: theme.spacing(1.25),
    marginLeft: theme.spacing(2.5),
  },
}));

export default useStyles;
