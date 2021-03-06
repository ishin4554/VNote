import { ofType } from "redux-observable";
import { of, from } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { ActionTypes, Actions } from "../actions";
import storage from "../utlis/storage";
import jwtDecode from "jwt-decode";
import * as api from "../utlis/api";

export const login = action$ =>
  action$.pipe(
    ofType(ActionTypes.LOGIN),
    switchMap(action => 
      from(api.login(action.payload)).pipe(
        map(res => {
          const user = jwtDecode(res.data.token).payload;
          storage.removeCookie();
          storage.addCookie(res.data.token);
          return Actions.LOGIN_RESULT(user);
        }),
        catchError(error => {
          return of(Actions.LOGIN_FAILED(error.response.data))
        })
      )
    )
  )

export const createUser = action$ =>
  action$.pipe(
    ofType(ActionTypes.CREATE_USER),
    switchMap(action => 
      from(api.createUser(action.payload)).pipe(
        map(() => Actions.CREATE_USER_RESULT(null)),
        catchError(error => of(Actions.CREATE_USER_RESULT(error.response.data)))
      )
    )
  )

export const getUsers = action$ =>
  action$.pipe(
    ofType(ActionTypes.GET_USERS),
    switchMap(action => 
      from(api.getUsers(action.payload)).pipe(
        map(res => Actions.GET_USERS_RESULT(res.data)),
        catchError(error => Actions.GET_USERS_FAILED(error.response.data))
      )
    )
  )

export const getUser = action$ =>
  action$.pipe(
    ofType(ActionTypes.GET_USER),
    switchMap(action => 
      from(api.getUser(action.id)).pipe(
        map(res => Actions.GET_USER_RESULT(res.data)),
        catchError(error => of(Actions.GET_USER_FAILED(error.response.data)))
      )
    )
  )

export const updateUser = action$ =>
  action$.pipe(
    ofType(ActionTypes.UPDATE_USER),
    switchMap(action => 
      from(api.updateUser(action.id, action.user)).pipe(
        map(() => Actions.UPDATE_USER_RESULT(null)),
        catchError(error => Actions.UPDATE_USER_RESULT(error.response.data))
      )
    )
  )