import {Component, OnInit} from "@angular/core";
import {CrudService} from "../services/crud.service";
import {Router} from "@angular/router";
import {AlertService} from "../services/alert.service";
import {config} from "../../config/config.js";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor(private crudService: CrudService,
              private router: Router,
              private alert: AlertService){

  }

  users: any = {};

  ngOnInit(){
    this.users = config.users;
  }

  login(user: any){
    this.crudService.login({'username': user.username, 'password': user.password}).then( (res: any) => {
      if(res.error){
        this.alert.clear();
        this.alert.error(res.reason);
      }else{
        localStorage.setItem('user', JSON.stringify(res));
        localStorage.setItem('org', user.org);
        this.router.navigate(['']);
      }
    });
  }
}
