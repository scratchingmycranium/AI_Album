import React from 'react';
import './App.css';
import PhotoAlbum from "./Components/AiPhotoAlbum"
import Amplify, { Auth } from 'aws-amplify';
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import { Layout, Menu } from 'antd';

// Cognito Private Credentials
import * as config from "./aws-exports.json";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

Amplify.configure({
    Auth: {
      region: config.userPoolRegion,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.userPoolWebClientId,

    },
    API: {
      endpoints: config.endpoints,
    },
});

const { Header, Content, Footer, Sider } = Layout;

function App() {
  return (
    <div>
      <Router>
        <Layout className="layout">
          <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">Home</Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '50px 50px' }}>
            <div className="site-layout-content">
              <Switch>
                <Route path="/">
                  <PhotoAlbum />
                </Route>
              </Switch>
            </div>
          </Content>
          <AmplifySignOut />
          <Footer style={{ textAlign: 'center' }}>Created By Simcha Coleman • sc4336@columbia.edu</Footer>
        </Layout>
      </Router>
    </div>
  );
}

export default withAuthenticator(App);
