import * as React from "react";
import { useState, forwardRef, useImperativeHandle } from "react";

import Snackbar from "@mui/joy/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Button from "@mui/joy/Button";

const SnackbarAlert = forwardRef(
  (
    {
      text,
      type,
    }: {
      text: string;
      type: "success" | "danger" | "primary" | "warning";
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [duration, setDuration] = React.useState<undefined | number>();
    const [left, setLeft] = React.useState<undefined | number>();
    const timer = React.useRef<ReturnType<typeof setInterval> | undefined>(
      undefined
    );
    const countdown = () => {
      timer.current = setInterval(() => {
        setLeft((prev) =>
          prev === undefined ? prev : Math.max(0, prev - 100)
        );
      }, 100);
    };
    React.useEffect(() => {
      if (open && duration !== undefined && duration > 0) {
        setLeft(duration);
        countdown();
      } else {
        window.clearInterval(timer.current);
      }
    }, [open, duration]);
    const handlePause = () => {
      window.clearInterval(timer.current);
    };
    const handleResume = () => {
      countdown();
    };

    const handleOpenSnackbar = () => {
      setOpen(true);
    };

    const handleCloseSnackbar = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      openSnackbar() {
        handleOpenSnackbar();
      },
    }));

    return (
      <React.Fragment>
        <Snackbar
          open={open}
          onClose={handleCloseSnackbar}
          autoHideDuration={duration}
          resumeHideDuration={left}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onFocus={handlePause}
          onBlur={handleResume}
          onUnmount={() => setLeft(undefined)}
          sx={{ minWidth: 360 }}
          color={type}
          size="md"
          variant="soft"
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          // startDecorator={<ReportProblemIcon />}
          endDecorator={
            <Button
              size="sm"
              aria-label="close"
              color="danger"
              variant="outlined"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon />
            </Button>
          }
        >
          {text}
        </Snackbar>
      </React.Fragment>
    );
  }
);

export default SnackbarAlert;
