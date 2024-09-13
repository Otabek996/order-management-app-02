/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import { useState, useRef } from "react";
import { ColorPaletteProp } from "@mui/joy/styles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Checkbox from "@mui/joy/Checkbox";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import { styled } from "@mui/system";
import {
  TablePagination,
  tablePaginationClasses as classes,
} from "@mui/base/TablePagination";
import Stack from "@mui/joy/Stack";
import CircularProgress from "@mui/joy/CircularProgress";

import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import DeleteIcon from "@mui/icons-material/Delete";

import SnackbarAlert from "../../snackbar-alert/SnackbarAlert";

import {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "../../../store/orders.api";

interface DataType {
  id: string;
  name: string;
  email: string;
  status: string;
  date: string;
}

type StatusType = "Delivered" | "Sent" | "Pending";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function OrderTable() {
  const [order, setOrder] = useState<Order>("desc");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [open, setOpen] = useState(false);
  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
        >
          <Option value="pending">Pending</Option>
          <Option value="sent">Sent</Option>
          <Option value="delivered">Delivered</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Category</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="refund">Refund</Option>
          <Option value="purchase">Purchase</Option>
          <Option value="debit">Debit</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDateModal, setOpenDateModal] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] =
    useState<DataType | null>(null);
  const [requestType, setRequestType] = useState("");

  const [newOrderId, setNewOrderId] = useState("");
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderEmail, setNewOrderEmail] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState("");

  const snackbarRefDelete = useRef<any>(null);
  const snackbarRefAdd = useRef<any>(null);
  const snackbarRefUpdate = useRef<any>(null);

  const [count, setCount] = useState("");

  const { data = [], isLoading } = useGetOrdersQuery(count);
  const [addOrder, { isError }] = useAddOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const handleDeleteOrder = async (id: string) => {
    await deleteOrder(id).unwrap();
    handleCloseDateModal();
    handleOpenDeleteSnackbar();
  };

  const handleAddOrder = async () => {
    try {
      if (newOrderName && newOrderEmail && newOrderStatus) {
        await addOrder({
          // id: newOrderId,
          name: newOrderName,
          email: newOrderEmail,
          status: newOrderStatus,
        }).unwrap();
        // setNewOrderId("");
        setNewOrderName("");
        setNewOrderEmail("");
        setNewOrderStatus("");
        triggerSnackbarAdd();
      }
    } catch (error) {
      console.error("Failed to add new order:", error);
    }
  };

  const handleUpdateOrder = async (
    id: string,
    updatedData: Partial<DataType>
  ) => {
    try {
      await updateOrder({ id, ...updatedData }).unwrap();
      handleOpenUpdateSnackbar();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const triggerSnackbarUpdate = () => {
    if (snackbarRefUpdate.current) {
      snackbarRefUpdate.current.openSnackbar();
    }
  };
  const handleOpenUpdateSnackbar = () => {
    triggerSnackbarUpdate();
  };

  const triggerSnackbarAdd = () => {
    if (snackbarRefAdd.current) {
      snackbarRefAdd.current.openSnackbar();
    }
  };

  const triggerSnackbarDelete = () => {
    if (snackbarRefDelete.current) snackbarRefDelete.current.openSnackbar();
  };
  const handleOpenDeleteSnackbar = () => {
    triggerSnackbarDelete();
  };

  const formatDate = (dateString: string): string => {
    if (dateString === "") return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Extract the YYYY-MM-DD part
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDateModal = (
    event: React.MouseEvent<unknown>,
    selectedDate: DataType,
    request: string
  ) => {
    setRequestType(request);
    setSelectedDateForModal(selectedDate);
    setOpenDateModal(true);
  };

  const handleCloseDateModal = () => {
    setOpenDateModal(false);
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", mx: "auto", my: 20 }}>
        <CircularProgress
          color="neutral"
          size="md"
          value={40}
          variant="solid"
        />
      </Box>
    );

  return (
    <React.Fragment>
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: "flex", sm: "none" }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>

        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet>

      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: "sm",
          py: 2,
          display: { xs: "none", sm: "flex" },
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search for order</FormLabel>
          <Input
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
            "--TableCell-paddingY": "4px",
            "--TableCell-paddingX": "8px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ width: 48, textAlign: "center", padding: "12px 6px" }}
              >
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== data.length
                  }
                  checked={selected.length === data.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked
                        ? data.map((element: DataType) => element.id)
                        : []
                    );
                  }}
                  color={
                    selected.length > 0 || selected.length === data.length
                      ? "primary"
                      : undefined
                  }
                  sx={{ verticalAlign: "text-bottom" }}
                />
              </th>
              <th style={{ width: 120, padding: "12px 6px" }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                  endDecorator={<ArrowDropDownIcon />}
                  sx={[
                    {
                      fontWeight: "lg",
                      "& svg": {
                        transition: "0.2s",
                        transform:
                          order === "desc" ? "rotate(0deg)" : "rotate(180deg)",
                      },
                    },
                    order === "desc"
                      ? { "& svg": { transform: "rotate(0deg)" } }
                      : { "& svg": { transform: "rotate(180deg)" } },
                  ]}
                >
                  ID
                </Link>
              </th>
              <th style={{ width: 140, padding: "12px 6px" }}>Date</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 240, padding: "12px 6px" }}>Customer</th>
              <th style={{ width: 140, padding: "12px 6px" }}> </th>
            </tr>
          </thead>

          <tbody>
            {(rowsPerPage > 0
              ? [...data]
                  .sort(getComparator(order, "id"))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : [...data].sort(getComparator(order, "id"))
            ).map((element: DataType) => (
              <tr
                key={element.id}
                onClick={(event) => handleOpenDateModal(event, element, "get")}
              >
                <td style={{ textAlign: "center", width: 120 }}>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(element.id)}
                    color={
                      selected.includes(element.id) ? "primary" : undefined
                    }
                    onChange={(event) => {
                      setSelected((ids) =>
                        event.target.checked
                          ? ids.concat(element.id)
                          : ids.filter((itemId) => itemId !== element.id)
                      );
                    }}
                    slotProps={{ checkbox: { sx: { textAlign: "left" } } }}
                    sx={{ verticalAlign: "text-bottom" }}
                  />
                </td>
                <td>
                  <Typography level="body-xs">{element.id}</Typography>
                </td>
                <td>
                  <Typography level="body-xs">
                    {formatDate(element.date)}
                  </Typography>
                </td>
                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        Delivered: <CheckRoundedIcon />,
                        Sent: <AutorenewRoundedIcon />,
                        Pending: <HourglassTopIcon />,
                      }[element.status as StatusType]
                    }
                    color={
                      {
                        Delivered: "success",
                        Sent: "primary",
                        Pending: "warning",
                      }[element.status as StatusType] as ColorPaletteProp
                    }
                  >
                    {element.status}
                  </Chip>
                </td>
                <td>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Avatar size="sm">{element.name.charAt(0)}</Avatar>
                    <div>
                      <Typography level="body-xs">{element.name}</Typography>
                      <Typography level="body-xs">{element.email}</Typography>
                    </div>
                  </Box>
                </td>
                <td>
                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "center" }}
                  ></Box>
                </td>
              </tr>
            ))}

            {emptyRows > 0 && (
              <tr style={{ height: 41 * emptyRows }}>
                <td colSpan={6} aria-hidden />
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <CustomTablePagination
                className="Pagination-laptopUp"
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={6}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    "aria-label": "Rows per page",
                  },
                  actions: {
                    showFirstButton: true,
                    showLastButton: true,
                    slots: {
                      firstPageIcon: FirstPageRoundedIcon,
                      lastPageIcon: LastPageRoundedIcon,
                      nextPageIcon: ChevronRightRoundedIcon,
                      backPageIcon: ChevronLeftRoundedIcon,
                    },
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </tr>
          </tfoot>
        </Table>

        <Modal open={openDateModal} onClose={handleCloseDateModal}>
          <ModalDialog color="neutral" layout="center" variant="outlined">
            <ModalClose />
            <Typography>Order</Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={3}>
              <FormControl>
                <FormLabel>ID</FormLabel>
                {requestType === "get" ? (
                  <Input
                    required
                    color="neutral"
                    placeholder="ID"
                    size="lg"
                    variant="outlined"
                    disabled
                    value={
                      selectedDateForModal
                        ? selectedDateForModal.id
                        : "ID is not defined"
                    }
                  />
                ) : (
                  <Input
                    required
                    color="neutral"
                    placeholder="ID"
                    size="lg"
                    variant="outlined"
                    disabled
                    value={
                      selectedDateForModal
                        ? selectedDateForModal.id
                        : "ID is not defined"
                    }
                    onChange={(e) => {
                      setSelectedDateForModal((prev) =>
                        prev ? { ...prev, id: e.target.value } : null
                      );
                      setNewOrderId(e.target.value);
                    }}
                  />
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  required
                  color="neutral"
                  placeholder="Name"
                  size="lg"
                  variant="outlined"
                  value={
                    selectedDateForModal
                      ? selectedDateForModal.name
                      : "NAME is not defined"
                  }
                  onChange={(e) => {
                    setSelectedDateForModal((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    );
                    setNewOrderName(e.target.value);
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  required
                  color="neutral"
                  placeholder="Email"
                  size="lg"
                  variant="outlined"
                  value={
                    selectedDateForModal
                      ? selectedDateForModal.email
                      : "EMAIL is not defined"
                  }
                  onChange={(e) => {
                    setSelectedDateForModal((prev) =>
                      prev ? { ...prev, email: e.target.value } : null
                    );
                    setNewOrderEmail(e.target.value);
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Input
                  required
                  color="neutral"
                  placeholder="Status"
                  size="lg"
                  variant="outlined"
                  value={
                    selectedDateForModal
                      ? selectedDateForModal.status
                      : "STATUS is not defined"
                  }
                  onChange={(e) => {
                    setSelectedDateForModal((prev) =>
                      prev ? { ...prev, status: e.target.value } : null
                    );
                    setNewOrderStatus(e.target.value);
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Created Date</FormLabel>
                <Input
                  required
                  color="neutral"
                  placeholder="Created Date"
                  size="lg"
                  variant="outlined"
                  disabled
                  value={
                    selectedDateForModal
                      ? formatDate(selectedDateForModal.date)
                      : "DATE is not defined"
                  }
                  onChange={(e) => {
                    setSelectedDateForModal((prev) =>
                      prev ? { ...prev, date: e.target.value } : null
                    );
                  }}
                />
              </FormControl>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2 }}>
              {selectedDateForModal && requestType === "get" && (
                <IconButton
                  color="danger"
                  variant="outlined"
                  onClick={() => handleDeleteOrder(selectedDateForModal.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}

              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  if (selectedDateForModal && requestType === "get") {
                    handleUpdateOrder(selectedDateForModal.id.toString(), {
                      name: selectedDateForModal.name,
                      email: selectedDateForModal.email,
                      status: selectedDateForModal.status,
                    });
                    console.log("Order was updated");
                  } else {
                    handleAddOrder();
                    console.log("Order was added");
                  }
                  handleCloseDateModal();
                  setSelectedDateForModal(null);
                }}
              >
                {requestType === "get" ? "Update order" : "Add order"}
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        <SnackbarAlert ref={snackbarRefDelete} text="Deleted" type="danger" />
        <SnackbarAlert ref={snackbarRefAdd} text="Added" type="success" />
        <SnackbarAlert ref={snackbarRefUpdate} text="Updated" type="primary" />
      </Sheet>

      <Box>
        <Button
          color="neutral"
          size="md"
          variant="outlined"
          onClick={(event) =>
            handleOpenDateModal(
              event,
              {
                id: "",
                name: "",
                email: "",
                status: "",
                date: "",
              },
              "add"
            )
          }
        >
          Add new order
        </Button>
      </Box>
    </React.Fragment>
  );
}

const blue = {
  200: "#A5D8FF",
  400: "#3399FF",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const CustomTablePagination = styled(TablePagination)(
  ({ theme }) => `
  & .${classes.spacer} {
    display: none;
  }

  & .${classes.toolbar}  {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .${classes.selectLabel} {
    margin: 0;
  }

  & .${classes.select}{
    font-family: 'IBM Plex Sans', sans-serif;
    padding: 2px 0 2px 4px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
    border-radius: 6px; 
    background-color: transparent;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    transition: all 100ms ease;

    &:hover {
      background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
    }

    &:focus {
      outline: 3px solid ${
        theme.palette.mode === "dark" ? blue[400] : blue[200]
      };
      border-color: ${blue[400]};
    }
  }

  & .${classes.displayedRows} {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .${classes.actions} {
    display: flex;
    gap: 6px;
    border: transparent;
    text-align: center;
  }

  & .${classes.actions} > button {
    display: flex;
    align-items: center;
    padding: 0;
    border: transparent;
    border-radius: 50%; 
    background-color: transparent;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    transition: all 100ms ease;

    > svg {
      font-size: 22px;
    }

    &:hover {
      background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
    }

    &:focus {
      outline: 3px solid ${
        theme.palette.mode === "dark" ? blue[400] : blue[200]
      };
      border-color: ${blue[400]};
    }

    &:disabled {
      opacity: 0.3;
      &:hover {
        border: 1px solid ${
          theme.palette.mode === "dark" ? grey[800] : grey[200]
        };
        background-color: transparent;
      }
    }
  }
  `
);
