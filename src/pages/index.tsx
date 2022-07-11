import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Chart } from "react-google-charts";

import DashboardService from 'services/api/Dashboard';
import { useAuth } from 'contexts/AuthUserContext';
import useService from 'hooks/useService';
import LayoutWithMenu from 'components/layout/LayoutWithMenu/LayoutWithMenu';

import * as S from 'styles/pages/Dashboard'

export default function Home() {
  const { authUser } = useAuth()
  const [experienceValues, setExperienceValues] = useState({
    salesMonth: null,
    salesByExperienceTypes: null,
    experiencesSalesSummary: null
  })

  const [getExperienceInfo] = useService(DashboardService.getExperienceInfo)

  useEffect(() => {
      if (authUser) {
        const { customerId } = authUser
        getExperienceInfo({ customerId }).then(({ salesByExperienceTypes, experiencesSalesSummary, salesMonth }) => {
          /**
           ************************ salesMonth:
           */
          const today = new Date()
          const currentMonth = today.getMonth()
          const dateSixMonthAgo = new Date(today.setMonth(currentMonth - 6))
          const monthSixMonthAgo = new Date(dateSixMonthAgo).getMonth() + 1 // JS date (-1)

          const sixMonthsArray = [...Array(6)].map((_, index) => {
            const nextMonth = dateSixMonthAgo.setMonth(monthSixMonthAgo + index)
            const monthName = String(new Date(nextMonth).toLocaleString('pt-BR', { month: "long" }))
            return ({
              qtTotal: 0,
              qtAvailable: null,
              qtSold: null,
              name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
              id: new Date(nextMonth).getUTCMonth() + 1
            })
          })

          const salesMonthValues: Array<any[]> = sixMonthsArray.map(item => {
            const index = salesMonth.findIndex(b => b.id === item.id)
            return [
              item.name,
              index !== -1 ? salesMonth[index].qtTotal : item.qtTotal
            ]
          })

          /**
           ************************ salesByExperienceTypes:
           */
           const salesByExperienceTypesValues: Array<any[]> = salesByExperienceTypes.map(item => ([
            item.name,
            item.qtSold
          ]))

          setExperienceValues({
            experiencesSalesSummary,
            salesByExperienceTypes: [["Experiências", "Quantidade"], ...salesByExperienceTypesValues],
            salesMonth: [["Mês", "Vendas"], ...salesMonthValues]
          })
        })
      }
  }, [authUser])

  return (
    <LayoutWithMenu>
      <S.Wrapper>
        <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={1}>
          {experienceValues.salesMonth && (
            <Chart
              width={'100%'}
              height={'400px'}
              chartType="PieChart"
              loader={<div>Carregando...</div>}
              data={experienceValues.salesByExperienceTypes}
              options={{
                title: 'Tipo de experiencias mais vendidas',
                titleTextStyle: {
                  fontSize: 14.5,
                  fontName: 'Roboto',
                  color: '#212121'
                },
                is3D: true,
                chartArea: {
                  width: '90%',
                  height: '70%'
                },
              }}
            />
            )}
        </Paper>
        <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={1}>
          {experienceValues.experiencesSalesSummary && (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                      <TableCell key={'Experiência'}>
                        Experiência
                      </TableCell>
                      <TableCell key={'Estoque'}>
                        Estoque
                      </TableCell>
                      <TableCell key={'Vendido'}>
                        Vendido
                      </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experienceValues.experiencesSalesSummary
                    .map((row) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                          <TableCell>
                            {row.name}
                          </TableCell>
                          <TableCell>
                            {row.qtTotal}
                          </TableCell>
                          <TableCell>
                            {row.qtSold}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
        <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={1}>
          {experienceValues.salesMonth && (
            <Chart
              chartType="LineChart"
              data={experienceValues.salesMonth}
              width={'100%'}
              height={'400px'}
              loader={<div>Carregando...</div>}
              options={{
                fontSize: 15,
                fontName: 'Roboto',
                title: 'Vendas por mês',
                titleTextStyle: {
                  fontSize: '0.875rem',
                  fontName: 'Roboto',
                  color: '#212121'
                },
                legend: {
                  pageIndex: -1,
                  position: 'top'
                },
                chartArea: {
                  width: '80%',
                  height: '60%'
                },
                hAxis: {
                  slantedText: true,
                  slantedTextAngle: 35
                },
              }}
            />
          )}
        </Paper>
      </S.Wrapper>
    </LayoutWithMenu>
  );
}
