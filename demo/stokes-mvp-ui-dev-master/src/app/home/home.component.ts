import {Component, OnInit, ViewChild} from "@angular/core";
import {ModalService} from "../services/modal.service";
import {AlertService} from "../services/alert.service";
import {Router} from "@angular/router";
import {UtilService} from "../services/util.service";
import {DomSanitizer} from "@angular/platform-browser";
import {CrudService} from "../services/crud.service";
import {NgxSpinnerService} from "ngx-spinner";
import {config} from "../../config/config.js";
import { saveAs } from 'file-saver/FileSaver';
import { PageEvent, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
declare var $: any;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})

export class HomeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayColumns=["transactionID","transactionType","blockNo","transactionTimestamp","user"];

  pageEvent: PageEvent;
  user: any = {};
  model: any = {};
  artwork: any = [];
  artworkTitle: string;
  artistName: string;
  assetID: string;
  selectedArtwork: any = {};
  showImage: boolean = false;
  showArtistName: boolean = false;
  upload: any = {};
  imgSrc: string = "";
  imageFile : File = null;
  years: any[] = config.dropdowns.years;
  selectedYear: any = config.dropdowns.selectedYears;
  artworkNameInput: string = "";
  artworkTitleInput: string = "";
  conditionReports: any = {};
  crRequested: boolean = false;
  header: any = {};
  toggleUploadArtwork: boolean = false;
  toggleArtworkDetail: boolean = false;
  showActionButton: boolean = false;
  actionButtonLabel: string = "";
  showCrUploadButton: boolean = false;
  viewCrButton: boolean = false;
  crPdfSrc: string = "";
  hasConditionReport: boolean = false;
  transit: any = {};
  notNumber: boolean = false;
  // transit: any = {
  //   destLocation : '',
  //   currentLocation: ''
  // };
  displayedRole: string = "";
  firstTab: string = "";
  secondTab: string = "";
  thirdTab: string = "";
  activeTab: string = "1";
  crArtHandlerCertCred: string = '';
  statusTimestamp: string = '';
  currentStatus: string = '';
  history: any = [];
  historyCounter: number = 0;
  status: any = {};
  deliveredReq: any = {};
  imageAbsolutePath: string = "";
  transactions: any ;
  showTransactions: boolean = false;
  constructor(private modalService: ModalService,
              private alertService: AlertService,
              private router: Router,
              private utilService: UtilService,
              private _sanitizer: DomSanitizer,
              private crudService: CrudService,
              private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    console.log('Logged in user', this.user);

    if (!this.user) {
      this.router.navigate(["login"]);
    } else {
      this.loadHeaders();
      this.setTabStyling();
      this.displayedRole = this.user.roles[0];
      console.log('Logged in user role', this.displayedRole);
      if (this.verifyRole(config.artist.roles)) {
        console.log('Artist user role');

        this.firstTab = config.artist.tabs.first;
        this.secondTab = config.artist.tabs.second;
        this.thirdTab = config.artist.tabs.third;
      } else if (this.verifyRole(config.handler.roles)) {
        console.log('Handler user role');

        this.firstTab = config.handler.tabs.first;
        this.secondTab = config.handler.tabs.second;
        this.thirdTab = config.handler.tabs.third;
      } else {
        console.log('Collector user role');

        this.firstTab = config.collector.tabs.first;
        this.secondTab = config.collector.tabs.second;
        this.thirdTab = config.collector.tabs.third;
      }
      this.loadDashboardImages();
    }
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  onSubmit_Orginial(form: any) {
    new Promise(async (resolve, reject) => {
      await this.crudService.createArtWork({
        artistName: form.controls.artistName.value,
        title: form.controls.artworkTitle.value,
        dimensions: form.controls.height.value + 'x' + form.controls.width.value + 'x' + form.controls.depth.value,
        edition: form.controls.edition.value,
        medium: form.controls.medium.value,
        noOfPieces: form.controls.noOfPieces.value,
        weight: form.controls.weight.value,
        year: form.controls.year.value,
        image: this.imgSrc,
        // artistRefID: this.user._id,
        creator: "com.stokes.network.ArtStudio#1001",
      }).then((res) => {
        this.upload = res;
        resolve();
      });
    }).then(() => {
      this.loadDashboardImages();
    }).then(() => {
      this.toggleUploadArtwork = false;
    });
  }

  onSubmit(form: any) {
    new Promise(async (resolve, reject) => {
      let formData = new FormData();
        formData.append('assetID', form.controls.assetID.value);
        formData.append('artistName', form.controls.artistName.value);
        formData.append('title', form.controls.artworkTitle.value);
        formData.append('dimensions', form.controls.height.value + 'x' + form.controls.width.value + 'x' + form.controls.depth.value);
        formData.append('edition', form.controls.edition.value);
        formData.append('medium', form.controls.medium.value);
        formData.append('noOfPieces', form.controls.noOfPieces.value);
        formData.append('weight', form.controls.weight.value);
        formData.append('year', form.controls.year.value);
        formData.append('image', this.imageFile);
        formData.append('creator', "com.stokes.network.ArtStudio#1001");

      await this.crudService.createArtWork(formData).then((res) => {
        this.upload = res;
        resolve();
      });
    }).then(() => {
      this.loadDashboardImages();
    }).then(() => {
      this.toggleUploadArtwork = false;
    });
  }
  logout() {
    localStorage.setItem("user", null);
    this.router.navigate(["login"]);
  }

  preview_image(event) {
    const reader = new FileReader();
    new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Error uploading file."));
      };
      reader.onload = () => {
        let output: any = document.getElementById("output_image");
        output.src = reader.result;
        resolve(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }).then((imgSrc) => {
      this.imageFile=event.target.files[0];
      //this.imgSrc = JSON.stringify(imgSrc); Commented to test multer API
    });
  }

  getStyle(imgSrc: string) {
    return this._sanitizer.bypassSecurityTrustStyle("url(" + imgSrc + ")");
  }

  requestConditionReport() {
    console.log("call /ConditionReport");
    return this.crudService.requestConditionReport({artworkID: this.model.artworkID}).then((res) => {
      console.log("requestConditionReport:", res);
      return res;
    });
  }

  getArtistName() {
    console.log("call /viewArtistName");
    // TODO: Fetch "artist name" from the "viewArtistName" offchain api endpoint (for the details https://ibm.ent.box.com/file/295427173625)
    // this.crudService.viewArtistName().then((res) => {});
    this.showArtistName = true;
  }

  getArtImage() {
    console.log("call /viewArtImage");
    // TODO: Fetch "art image" from the "viewArtImage" offchain api endpoint (for the details https://ibm.ent.box.com/file/295427173625)
    // this.crudService.viewArtImage().then((res) => {});
    this.showImage = true;
  }

  getArtworkDetails(artwork: any) {
    // TODO: Invoke the api "viewArtWork" composer endpoint to fetch a particular Art Work
    // this.crudService.viewArtWork().then((res) => {});
    console.log("call /viewArtWork");
    console.log(artwork);
    // this.selectedArtwork = artwork;
    // this.selectedArtwork.requestSubmitted = this.checkCrStatus(this.selectedArtwork);
  }

  checkCrStatus(artwork: any) {
    for (let r in this.conditionReports.request) {
      if (artwork.artworkID == this.conditionReports.request[r].artworkID) {
        return true;
      }
    }
    return false;
  }

  verifyRole(roles: any) {
    if(this.user == null){
      this.router.navigate(['login']);
    }else{
      for (let i in roles) {
        for (let j in this.user.roles) {
          if (roles[i] == this.user.roles[j])
            return true;
        }
      }
    }
    return false;
  }

  loadDashboardImages(){
    this.artwork = {tab1: [], tab2: [], tab3: [],};
    if (this.verifyRole(config.artist.roles)) {
      console.log('Fetch artist dashboard');
      this.getArtistDash();
    } else if (this.verifyRole(config.handler.roles)) {
      console.log('Fetch handler dashboard');
      this.getHandlerDash();
    } else {
      console.log('Fetch manager dashboard');
      this.getManagerDash();
    }
    this.showTransactions=false;
  }

  getArtistDash(){
    this.spinner.show();
    
    this.crudService.getArtistDash().then(async (artwork: any) => {
      console.log("Data for myCollection ", artwork.myCollection);
      for (let a in artwork.myCollection) {
        await this.crudService.getArtworkById(artwork.myCollection[a].artworkID).then((artwork) => {
          this.artwork.tab1.push(artwork);
        });
      }

      console.log("Data for negotiating ", artwork.negotiating);
      for (let a in artwork.negotiating) {
        await this.crudService.getArtworkById(artwork.negotiating[a].artworkID).then((artwork) => {
          this.artwork.tab2.push(artwork);
        });
      }
      console.log("Data for sold ", artwork.negotiating);
      
      for (let a in artwork.sold) {
        await this.crudService.getArtworkById(artwork.sold[a].artworkID).then((artwork) => {
          this.artwork.tab3.push(artwork);
        });
      }
    }).then(() => {
      this.spinner.hide();
    });
  }

  getManagerDash(){
    this.spinner.show();
    this.crudService.getManagerDash().then(async (artwork: any) => {
      for (let a in artwork.myCollection) {
        await this.crudService.getArtworkById(artwork.myCollection[a].artworkID).then((artwork) => {
          this.artwork.tab1.push(artwork);
        });
      }

      for (let a in artwork.considering) {
        await this.crudService.getArtworkById(artwork.considering[a].artworkID).then((artwork) => {
          this.artwork.tab2.push(artwork);
        });
      }

      for (let a in artwork.available) {
        await this.crudService.getArtworkById(artwork.available[a].artworkID).then((artwork) => {
          this.artwork.tab3.push(artwork);
        });
      }
    }).then(() => {
      this.spinner.hide();
    });
  }

  getHandlerDash(){
    this.spinner.show();
    this.crudService.getHandlerDash().then(async (artwork: any) => {
      for (let a in artwork.new) {
        await this.crudService.getArtworkById(artwork.new[a].artworkID).then((artwork) => {
          this.artwork.tab1.push(artwork);
        });
      }

      for (let a in artwork.inProgress) {
        await this.crudService.getArtworkById(artwork.inProgress[a].artworkID).then((artwork) => {
          this.artwork.tab2.push(artwork);
        });
      }

      for (let a in artwork.complete) {
        await this.crudService.getArtworkById(artwork.complete[a].artworkID).then((artwork) => {
          this.artwork.tab3.push(artwork);
        });
      }
    }).then(() => {
      this.spinner.hide();
    });
  }

  findArtwork(type: string, data: string) {
    this.spinner.show();
    this.artwork = [];
    data = (type == "year") ? this.selectedYear.id : data.replace(/\s+/g, "+");
    this.crudService.findArtwork(type, data).then((artwork) => {
      console.log(artwork);
      let imgRefList = [];
      for (let a in artwork) imgRefList.push(artwork[a].artworkID);
      console.log(imgRefList);
      return imgRefList;
    }).then(async (imgRefList) => {
      for (let i in imgRefList) {
        await this.crudService.getArtworkById(imgRefList[i]).then((artwork) => {
          this.artwork.push(artwork);
        });
      }
    }).then(() => {
      if (type != "year") this.reset();
      this.spinner.hide();
    }).catch((err) => {
      console.log(err);
      this.spinner.hide();
    });
  }

  reset() {
    this.selectedYear = {id: 0, label: ""};
  }

  loadHeaders() {
    if (this.verifyRole(config.artist.roles)) {
      this.header.first = config.artist.tabs.first;
      this.header.second = config.artist.tabs.second;
      this.header.third = config.artist.tabs.third;
    } else if (this.verifyRole(config.collector.roles)) {
      this.header.first = config.collector.tabs.first;
      this.header.second = config.collector.tabs.second;
      this.header.third = config.collector.tabs.third;
    } else if (this.verifyRole(config.handler.roles)) {
      this.header.first = config.handler.tabs.first;
      this.header.second = config.handler.tabs.second;
      this.header.third = config.handler.tabs.third;
    }
  }

  detailAction() {
    if (this.actionButtonLabel == config.collector.actionButton.interested) {
      this.spinner.show();
      this.requestConditionReport().then(async () => {
        await this.loadDashboardImages();
      }).then(() => {
        this.spinner.hide();
        this.openModal("interested-notification");
        this.closeAllSub();
        this.showActionButton = false;
      }).catch((err) => {
        console.log(err);
        this.spinner.hide();
      });
    } else if (this.actionButtonLabel == config.artist.actionButton.ownershipRequest) {
      this.openModal("transit-request");
    } else if (this.actionButtonLabel == config.collector.actionButton.buy) {
      this.spinner.show();
      this.crudService.requestOwnership({
        artworkID: this.model.artworkID,
        proposedOwner: this.user._id
      }).then(async () => {
        await this.loadDashboardImages();
      }).then(() => {
        $('#tab2').click();
      }).then(() => {
        this.spinner.hide();
        this.openModal("purchase-request");
        this.showActionButton = false;
      });
    }else if(this.actionButtonLabel == config.handler.actionButton.initiate){
      this.transit = {
        destLocation : '',
        currentLocation: ''
      };
      this.transit.transportationStatus = 'LOADED';
      this.openModal("initiate-transport");
    } else if(this.actionButtonLabel == config.collector.actionButton.received) {
      this.spinner.show();
      this.crudService.receiveArtwork(this.model.artworkID).then(async (res) => {
        await this.loadDashboardImages();
        this.spinner.hide();
        console.log(res);
      }).then(() => {
        this.closeAllSub();
      }).catch((err) => {
        this.spinner.hide();
        console.log(err);
      });
    } else {
      let delivered = false;
      this.transit = { "artworkID": this.model.artworkID };
      if (this.actionButtonLabel == config.handler.actionButton.in_transit) {
        this.transit.transportationStatus ='IN_TRANSIT';
        this.transportationUpdate();
      } else if (this.actionButtonLabel == config.handler.actionButton.unloaded) {
        this.transit.transportationStatus ='UNLOADED';
        this.transportationUpdate();
      } else if (this.actionButtonLabel == config.handler.actionButton.delivered) {
        // this.transit.transportationStatus ='DELIVERED';
        // delivered = true;
        this.crudService.deliverArtwork(this.deliveredReq).then(async () => {
          await this.loadDashboardImages();
          this.spinner.hide();
        }).then(() => {
          this.closeAllSub();
        }).catch((err) => {
          this.spinner.hide();
          console.log(err);
        });
      }
    }
  }

  formatDate(date: string){
    return new Date(date).toLocaleDateString("en-us", {
      weekday: "long", year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  configDetails(artwork: any) {
    this.showTransactions=false;
    this.model = artwork;
    console.log("user:", this.user);
    console.log("model:", this.model);
    this.statusTimestamp = this.formatDate(this.model.changedByDateTime);

    this.currentStatus = this.model.artworkEvents[this.model.artworkEvents.length - 1].description;

    if (this.verifyRole(config.collector.roles)) {
      if (this.model.hasOwnProperty("conditionReport")) {
        if (this.model.conditionReport.crStatus == config.STATUSES.REQUEST) {
          this.showActionButton = false;
        } else if (this.model.conditionReport.crStatus == config.STATUSES.SUBMITTED && this.model.ownershipStatus != config.STATUSES.REQUEST && this.model.transportationStatus != config.STATUSES.DELIVERED) {
          this.hasConditionReport = true;
          this.showActionButton = true;
          this.actionButtonLabel = config.collector.actionButton.buy;
        }
      } else {
        this.showActionButton = true;
        this.actionButtonLabel = config.collector.actionButton.interested;
      }

      if (this.model.hasOwnProperty("transportationStatus")){
        if(this.model.transportationStatus == config.STATUSES.DELIVERED && !this.verifyRole(['Collection Manager'])){
          this.actionButtonLabel = config.collector.actionButton.received;
          this.showActionButton = true;
        }
      }

      if (this.model.hasOwnProperty("ownershipStatus")){
        if (this.model.ownershipStatus == 'TRANSFERRED'){
          this.showActionButton = false;
        }
      }

    } else if (this.verifyRole(config.artist.roles)) {
      if (this.model.hasOwnProperty("conditionReport")) {
        if (this.model.conditionReport.crStatus == config.STATUSES.SUBMITTED) {
          this.hasConditionReport = true;
          this.viewCrButton = true;
        }
      }

      if (this.model.hasOwnProperty("ownershipStatus")){
        if (this.model.ownershipStatus == 'REQUEST'){
          this.showActionButton = true;
          this.actionButtonLabel = config.artist.actionButton.ownershipRequest;
        }
      }

      // TODO: check for purchase request, display notification
      // this.openModal('accept-ownership');

    } else if (this.verifyRole(config.handler.roles)) {
      if (this.model.hasOwnProperty("conditionReport")) {
        if (this.model.conditionReport.crStatus == config.STATUSES.REQUEST) {
          this.actionButtonLabel = config.handler.actionButton.uploadCr;
          this.showCrUploadButton = true;
        } else if (this.model.conditionReport.crStatus == config.STATUSES.SUBMITTED) {
          this.hasConditionReport = true;
        }
      }

      if (this.model.hasOwnProperty("transportationStatus")) {
        if(this.model.transportationStatus == config.STATUSES.REQUEST){
          this.actionButtonLabel = config.handler.actionButton.initiate;
          this.showActionButton = true;
        }else if(this.model.transportationStatus == config.STATUSES.LOADED){
          this.actionButtonLabel = config.handler.actionButton.in_transit;
          this.showActionButton = true;
        }else if(this.model.transportationStatus == config.STATUSES.IN_TRANSIT){
          this.showActionButton = true;
          this.actionButtonLabel = config.handler.actionButton.unloaded;
          this.showActionButton = true;
        }else if(this.model.transportationStatus == config.STATUSES.UNLOADED){
          this.actionButtonLabel = config.handler.actionButton.delivered;
          this.showCrUploadButton = true;
        }
      }

    }

    this.history = this.model.artworkEvents;

    this.toggleArtworkDetail = true;
  }

  uploadCr(event: any) {
    this.spinner.show();
    const reader = new FileReader();
    new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Error uploading file."));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }).then((src: any) => {
      this.crudService.submitConditionReport({
        artworkID: this.model.artworkID,
        conditionReport: src,
        artHandlerName: this.user.firstname + ' ' + this.user.lastname,
        crArtHandlerCertCred: this.crArtHandlerCertCred
      }).then(async () => {
        await this.loadDashboardImages();
      }).then(() => {
        this.toggleArtworkDetail = false;
        this.spinner.hide();
      });
    });
  }

  uploadSecondCr(event: any) {
    const reader = new FileReader();
    new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Error uploading file."));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }).then((src: any) => {
      this.deliveredReq = {
        artworkID: this.model.artworkID,
        conditionReport: src,
        artHandlerName: this.user.firstname + ' ' + this.user.lastname,
        crArtHandlerCertCred: this.crArtHandlerCertCred
      };
      this.showActionButton = true;
      // this.crudService.deliverArtwork(
      //   {
      //   artworkID: this.model.artworkID,
      //   conditionReport: src,
      //   artHandlerName: this.user.firstname + ' ' + this.user.lastname,
      //   crArtHandlerCertCred: this.crArtHandlerCertCred
      // }).then(() => {
      //   this.showActionButton = true;
      // });
    });
  }

  viewCr() {
    this.spinner.show();
    this.crudService.getConditionReport(this.model.conditionReport.crRefID).then((cr: any) => {
      console.log(cr);
      this.crPdfSrc = cr.conditionReport;
      this.openModal("cr-preview");
      this.spinner.hide();
    });
  }

  loadPDF(url) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  actionOnOwnershipRequest() {
    this.spinner.show();
    this.crudService.actionOnOwnershipRequest({
      artworkID: this.model.artworkID,
      action: config.STATUSES.ACCEPTED
    }).then((res) => {
      console.log(res);
      this.crudService.transportationRequest(this.model.artworkID).then((res) => {
        console.log(res);
        this.spinner.hide();
      }).then(async () => {
        await this.loadDashboardImages();
      }).then(() => {
        this.closeAllSub();
      });
    }).catch((err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  updateTransportation(status: string) {
    let data = {};
    if (status == config.STATUSES.LOADED) {
      data = {
        currentLocation: this.transit.start,
        destLocation: this.transit.end,
        transportationStatus: status
      };
    } else if (status == config.STATUSES.IN_TRANSIT) {
      data = {
        transportationStatus: status
      };
    } else if (status == config.STATUSES.DELIVERED) {
      data = {
        transportationStatus: status
      };
    }

    this.crudService.updateTransportation(data).then(() => {

    });
  }

  closeAllSub() {
    this.toggleUploadArtwork = false;
    this.toggleArtworkDetail = false;
    this.showCrUploadButton = false;
  }

  setTabStyling() {
    if (this.activeTab == "1") {
      $("#tab1").css({"background-color": "#d3d3d3", "color": "#000000"});
      $("#tab2").css({"background-color": "#F37F19", "color": "#FFFFFF"});
      $("#tab3").css({"background-color": "#F37F19", "color": "#FFFFFF"});
    } else if (this.activeTab == "2") {
      $("#tab1").css({"background-color": "#F37F19", "color": "#FFFFFF"});
      $("#tab2").css({"background-color": "#d3d3d3", "color": "#000000"});
      $("#tab3").css({"background-color": "#F37F19", "color": "#FFFFFF"});
    } else if (this.activeTab == "3") {
      $("#tab1").css({"background-color": "#F37F19", "color": "#FFFFFF"});
      $("#tab2").css({"background-color": "#F37F19", "color": "#FFFFFF"});
      $("#tab3").css({"background-color": "#d3d3d3", "color": "#000000"});
    }
  }

  transportationUpdate(){
    this.transit.artworkID = this.model.artworkID;
    this.spinner.show();
    this.closeModal('initiate-transport');
    this.crudService.transportationUpdate(this.transit).then((res) => {
      this.showActionButton = false;
      console.log(res);
    }).then(async () => {
      await this.loadDashboardImages();
    }).then(() => {
      this.closeAllSub();
      this.spinner.hide();
    }).catch((err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  checkStatus(status: string){
    for(let e in this.model.artworkEvents){
      if(this.model.artworkEvents[e].description == status){
        return true;
      }
    }
    return false;
  }

  download(imagePath: string){
    console.log("imagePath :"+imagePath);
  this.crudService.downloadArtwork({
        artPath: imagePath
      })
  }

  getTransactionsByArtworkId(artworkId: string){
    let transactionsArry = [];
    if(this.showTransactions==false){
    this.crudService.getAllTransactionsByArtworkId(artworkId).then((transactions: any) => {
      console.log(transactions);
      transactionsArry=transactions;
      this.transactions = new MatTableDataSource(transactionsArry.sort((a, b) => b.blockNo - a.blockNo));
      
      //this.transactions.paginator = this.paginator;
      //this.transactions.sort = this.sort;
      this.showTransactions=true;
    });
  }else
    this.showTransactions=false;
  }
  numbersOnly(assetID) {
    console.log(assetID);
    if(assetID.match(/[^0-9]/g)){
    this.model.assetID = assetID.replace(/[^0-9]/g, '');
    this.notNumber=true;
    }else{
      this.notNumber=false;
    }
  }
}
