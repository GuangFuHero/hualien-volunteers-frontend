import React, { useEffect, useState } from "react";
import { Container, Box, Button, ThemeProvider, CssBaseline, Chip, Typography } from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Header from "./components/Header";
import RequestCard from "./components/RequestCard";
import Pagination from "./components/Pagination";
import Toast from "./components/Toast";

// dialogs
import CreateDialog from "./components/dialogs/CreateDialog";
import EditDialog from "./components/dialogs/EditDialog";
import DeliveryDialog from "./components/dialogs/DeliveryDialog";

import { safeApiRequest } from "./utils/helpers";
import isCompleted from "./utils/isCompleted";

import theme from './colorPalatte'
import { Maintenance } from "./components/Maintenance";

import { Analytics } from "@vercel/analytics/react"
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';


export default function App() {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const [openCreate, setOpenCreate] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelivery, setOpenDelivery] = useState(false);
  const [totalPage, setTotalPage] = useState(2);

  const [editData, setEditData] = useState();
  const [deliveryData, setDeliveryData] = useState();

  const [requestState, setRequestState] = useState('active')
  const [listFilter, setListFilter] = React.useState([""])

  const [originalData, setOriginalData] = React.useState([])

  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    loadData(page, requestState, true);
  }, [page]);

  useEffect(() => {
    // Reload data whenever filters change so server-side filtering (q_role) is applied
    setPage(0)
    loadData(page, requestState, true);
  }, [listFilter, requestState])

  function renderCards(data) {
    //擋掉soft deleted 的資料:  {status:"need_delete"}
    const requests = data.filter(d => d.status !== "need_delete");

    //依據更新時間進行排序
    const sortedRequests = [...requests].sort((a, b) => b.updated_at - a.updated_at);

    // const filtreedRequest = [...sortedRequests].filter(item => {
    //   for (let i = 0; i < listFilter.length; i++) {
    //     if (item.assignment_notes.includes(listFilter[i]) || item.role_name.includes(listFilter[i]) || item.role_type.includes(listFilter[i])) {
    //       return true
    //     }
    //   }
    //   return false
    // })


    setRequests(sortedRequests)

  }

  const loadData = async (offset, state, shouldScrollThePage) => {
    setIsLoading(true)
    setRequests([])
    const result = await safeApiRequest(
      `${process.env.REACT_APP_API_BASE_URL}/human_resources?limit=20&offset=${offset * 20}&status=${state}&q_role=${listFilter}`
    );
    if (result.success) {
      setOriginalData(result.data.member)
      setIsLoading(false)

      renderCards(result.data.member)
      setTotalPage((result.data.totalItems % 20 === 0) ? (result.data.totalItems / 20) : Math.floor(result.data.totalItems / 20) + 1)

      if (shouldScrollThePage) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  function handlePageChange(newPage) {
    setRequests([])
    setPage(newPage)
  }


  function EditRequest(data) {
    setEditData(data)
    setOpenEdit(true)
  }


  function DeliveryRequest(data) {
    setDeliveryData(data)
    setOpenDelivery(true)
  }

  function onEditSubmittedCallback(isSuccess) {
    if (isSuccess) {
      setToastMsg("需求更新成功!");
      setOpenEdit(false);
      loadData(page, requestState, false);
    } else {
      setToastMsg("需求更新失敗，請再試一次!");
    }
  }

  function onDeliverySubmittedCallback(isSuccess) {
    if (isSuccess) {
      setToastMsg("加入成功!");
      setOpenDelivery(false);
      loadData(page, requestState, false);
    } else {
      setToastMsg("加入失敗，請再試一次!");
    }
  }
  function onCreateSubmittedCallback(isSuccess) {
    if (isSuccess) {
      setToastMsg("需求已送出!");
      setOpenCreate(false);
      loadData(page, requestState, false);
    } else {
      setToastMsg("需求送出失敗，請再試一次!");
    }
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header onCreate={() => setOpenCreate(true)} />
        <Container sx={{ mt: 3 }}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Tabs
              value={requestState}
              onChange={(e, v) => { setRequestState(v); setRequests([]); setPage(0) }}
            >
              <Tab value="active" label="尚缺志工" />
              <Tab value="completed" label="已完成" />
            </Tabs>

          </Box>
          <Box sx={{ width: "100%", mb: 1, userSelect: "none" }}>
            <Chip color={listFilter[0] === "" ? "primary" : ""} label="所有需求" sx={{ mr: 1 }} onClick={() => { setListFilter([""]) }} />
            <Chip color={listFilter.includes("一般志工") ? "primary" : ""} label="一般志工" sx={{ mr: 1 }} onClick={() => { setListFilter(["一般志工"]) }} />
            <Chip color={listFilter.includes("水電") ? "primary" : ""} label="水電" sx={{ mr: 1 }} onClick={() => { setListFilter(["水電"]) }} />
            <Chip color={listFilter.includes("機具") ? "primary" : ""} label="機具" sx={{ mr: 1 }} onClick={() => { setListFilter(["機具", "山貓", "怪手", "挖土機"]) }} />
            <Chip color={listFilter.includes("門") ? "primary" : ""} label="門窗" sx={{ mr: 1 }} onClick={() => { setListFilter(["門", "窗"]) }} />
          </Box>
          {(requests.length === 0 && isLoading) && <>
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: '5rem' }} />
            </Stack>
          </>}
          {/* {(requests.length === 0 && !isLoading) && <>
            <Stack spacing={1}>
              <Typography variant="h6">此頁查無符合條件的需求，您可以點選下方分頁按鈕，切換至其他分頁</Typography>
            </Stack>
          </>} */}
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onEdit={(data) => EditRequest(data)}
              onDelivery={(data) => DeliveryRequest(data)}
              showToastMsg={(m) => setToastMsg(m)}
            />
          ))}

          <Pagination page={page + 1} onPageChange={handlePageChange} count={totalPage} />
        </Container>

        <CreateDialog open={openCreate} onSubmittedCallback={onCreateSubmittedCallback} onClose={() => setOpenCreate(false)} />
        <EditDialog open={openEdit} onSubmittedCallback={onEditSubmittedCallback} request={editData} onClose={() => setOpenEdit(false)} />
        <DeliveryDialog open={openDelivery} onSubmittedCallback={onDeliverySubmittedCallback} onClose={() => setOpenDelivery(false)} request={deliveryData} />

        {/* <Maintenance/> */}

        <Toast message={toastMsg} onClose={() => setToastMsg("")} />
        <Analytics />
      </ThemeProvider>
    </>
  );
}
