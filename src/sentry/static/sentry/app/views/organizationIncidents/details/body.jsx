import React from 'react';
import moment from 'moment';
import styled from 'react-emotion';

import {PageContent} from 'app/styles/organization';
import {t} from 'app/locale';
import LineChart from 'app/components/charts/lineChart';
import Link from 'app/components/links/link';
import MarkPoint from 'app/components/charts/components/markPoint';
import NavTabs from 'app/components/navTabs';
import SentryTypes from 'app/sentryTypes';
import theme from 'app/utils/theme';

import Activity from './activity';
import IncidentsSuspects from './suspects';

const TABS = {
  activity: {name: t('Activity'), component: Activity},
};

export default class DetailsBody extends React.Component {
  static propTypes = {
    incident: SentryTypes.Incident,
  };
  constructor(props) {
    super(props);
    this.state = {
      activeTab: Object.keys(TABS)[0],
    };
  }
  handleToggle(tab) {
    this.setState({activeTab: tab});
  }

  render() {
    const {params, incident} = this.props;
    const {activeTab} = this.state;
    const ActiveComponent = TABS[activeTab].component;

    const detectedTs = incident && moment.utc(incident.dateStarted).unix();
    let closestTimestampIndex;
    const chartData =
      incident &&
      incident.eventStats.data.map(([ts, val], i) => {
        if (ts > detectedTs) {
          closestTimestampIndex = i > 0 ? i - 1 : 0;
        }
        return [
          ts * 1000,
          val.length ? val.reduce((acc, {count} = {count: 0}) => acc + count, 0) : 0,
        ];
      });
    const markPointCoordinate = chartData && chartData[closestTimestampIndex];

    return (
      <StyledPageContent>
        <Main>
          <PageContent>
            <NavTabs underlined={true}>
              {Object.entries(TABS).map(([id, {name}]) => (
                <li key={id} className={activeTab === id ? 'active' : ''}>
                  <Link onClick={() => this.handleToggle(id)}>{name}</Link>
                </li>
              ))}
            </NavTabs>
            <ActiveComponent params={params} incident={incident} />
          </PageContent>
        </Main>
        <Sidebar>
          <PageContent>
            {incident && (
              <LineChart
                isGroupedByDate
                series={[
                  {
                    seriesName: t('Events'),
                    dataArray: chartData,
                    markPoint: MarkPoint({
                      symbol:
                        'image://data:image/png;base64,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',
                      data: [
                        {
                          coord: markPointCoordinate,
                        },
                      ],
                    }),
                  },
                ]}
              />
            )}
            <IncidentsSuspects suspects={[]} />
          </PageContent>
        </Sidebar>
      </StyledPageContent>
    );
  }
}

const Main = styled('div')`
  width: 60%;
  @media (max-width: ${theme.breakpoints[0]}) {
    width: 100%;
  }
`;

const Sidebar = styled('div')`
  width: 40%;
  border-left: 1px solid ${p => p.theme.borderLight};
  background-color: ${p => p.theme.white};
  @media (max-width: ${theme.breakpoints[0]}) {
    width: 100%;
    border: 0;
  }
`;

const StyledPageContent = styled(PageContent)`
  padding: 0;
  flex-direction: row;
  @media (max-width: ${theme.breakpoints[0]}) {
    flex-direction: column;
  }
`;
