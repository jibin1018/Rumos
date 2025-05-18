import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import PropertyUpload from './pages/PropertyUpload';
import UserProfile from './pages/UserProfile';
import AgentProfile from './pages/AgentProfile';
import AdminDashboard from './pages/AdminDashboard';
import Favorite from './pages/Favorite';
import Board from './pages/Board';
import BoardDetail from './pages/BoardDetail';
import CreatePost from './pages/CreatePost';
import NotFound from './pages/NotFound';

// Route with auth guard
const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        // Not logged in
        if (!isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        
        // Check if user has required role
        if (roles && !roles.includes(currentUser.role)) {
          return <Redirect to="/" />;
        }
        
        // Authenticated and authorized
        return <Component {...props} />;
      }}
    />
  );
};

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route exact path="/properties" component={PropertyList} />
      <Route exact path="/properties/:id" component={PropertyDetail} />
      <PrivateRoute 
        path="/properties/upload" 
        component={PropertyUpload}
        roles={['agent', 'admin']} 
      />
      <PrivateRoute 
        path="/properties/edit/:id" 
        component={PropertyUpload}
        roles={['agent', 'admin']} 
      />
      <PrivateRoute 
        path="/profile/user" 
        component={UserProfile} 
        roles={['user', 'admin']}
      />
      <PrivateRoute 
        path="/profile/agent" 
        component={AgentProfile} 
        roles={['agent', 'admin']}
      />
      <PrivateRoute 
        path="/admin" 
        component={AdminDashboard} 
        roles={['admin']}
      />
      <PrivateRoute 
        path="/favorites" 
        component={Favorite}
        roles={['user', 'admin']} 
      />
      <Route exact path="/board" component={Board} />
      <Route exact path="/board/:id" component={BoardDetail} />
      <PrivateRoute path="/board/create" component={CreatePost} />
      <PrivateRoute path="/board/edit/:id" component={CreatePost} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
