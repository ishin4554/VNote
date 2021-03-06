import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import Course from "./course";
import Sign from "./sign";
import Home from "./home";
import CoursesList from "./coursesList";
import NotFound from "../components/notFound";


const Routes = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home} />
      <Route exact path='/course/:id' component={Course} />
      <Route exact path='/login' component={Sign} />
      <Route exact path='/register' component={Sign} />
      <Route exact path='/courses' component={CoursesList} />
      <Route path="" component={NotFound} />
    </Switch>
  );
};

export default withRouter(Routes);
