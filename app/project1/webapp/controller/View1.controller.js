sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/message/MessageManager",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageManager, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {

            this._oMessageManager = sap.ui.getCore().getMessageManager();
            this._oMessageManager.registerObject(this.getView(), true);
            this.getView().setModel(this._oMessageManager.getMessageModel(), "message");

            //    this.getView().setModel(new JSONModel({ editable: false }), "editmode");

        },
        _showLastBackendError: function () {
            const aMessages = this._oMessageManager.getMessageModel().getData()[0].message;
            // find the last error message
            // const oErr = this._oMessageManager.getMessageModel().getData()[0].type === 'Error'[...aMessages].reverse().find(m => m.getType() === "Error");

            if (this._oMessageManager.getMessageModel().getData()[0].type === 'Error') {
                MessageBox.error(aMessages);
                this.onDialogClose();
            } else {
                MessageBox.error("Creation failed due to an unknown error.");
            }

            // optional: clear messages after showing
            this._oMessageManager.removeAllMessages();
        },
        async onCreate() {
            if (!this.oDialog) {
                this.oDialog ??= await this.loadFragment({
                    name: "project1.view.fragment.CreateForm"
                });
                this.getView().addDependent(this.oDialog);
            }

            this.oDialog.open();
        },
        onCreateBook(oEvent) {

            let oPayload = {
                ID: this.byId("formId").getValue(),
                title: this.byId("formTitle").getValue(),
                author: this.byId("formAuthor").getValue(),
                price: this.byId("formPrice").getValue(),
                stock: this.byId("formStock").getValue()
            }

            let oListBinding = this.getView().getModel().bindList("/Books");

            // IMPORTANT: listen to createCompleted
            var fnCreateCompleted = function (oEvent) {
                // detach so we don't register multiple times
                oListBinding.detachCreateCompleted(fnCreateCompleted);

                var bSuccess = oEvent.getParameter("success");

                if (bSuccess) {
                    sap.m.MessageToast.show("Book details created successfully");
                    this.onDialogClose();
                } else {
                    // here we use MessageManager to read CAP error message
                    this._showLastBackendError();
                    this.onDialogClose();

                    // optional: remove transient context if needed
                    var oCtx = oEvent.getParameter("context");
                    if (oCtx && oCtx.isTransient && oCtx.isTransient()) {
                        oCtx.delete();
                    }
                }
            }.bind(this);

            oListBinding.attachCreateCompleted(fnCreateCompleted);

            // 3. Trigger the create
            oListBinding.create(oPayload);
            // this.oDialog.close();
        },
        onDialogClose() {
            this._clearDialogInputs();
            this.oDialog.close();
        },
        _clearDialogInputs() {
            var oView = this.getView();
            oView.byId("formId").setValue("");
            oView.byId("formTitle").setValue("");
            oView.byId("formAuthor").setValue("");
            oView.byId("formPrice").setValue("");
            oView.byId("formStock").setValue("");


        },
        onUpdate(oEvent) {
            debugger;
            //let cellList = oEvent.getSource().getParent().getCells();
            // for (let index = 0; index < cellList.length; index++) {
            // cellList[index].setEditable(true);
            // }
            //for (const cell of cellList) {
            // cell.setEditable(true);
            // }
            //cellList.forEach(cell => cell.setEditable(true));
            oEvent.getSource().getParent().getCells().forEach((cell, index) => {
                if (index !== 1) {
                    cell.setEditable?.(true)
                }

            });

        },
        onEditRow(oEvent) {
            // got each cell will 
            oEvent.getSource().getParent().getParent().getCells().forEach((cell, index) => {
                if (index !== 0)
                    cell.setEditable?.(true)
            });

            oEvent.getSource().getParent().getItems().forEach(item => item.setVisible(!item.getVisible()))
        },
        onSaveRow(oEvent) {

            this.getView().getModel().submitBatch('$auto').then(function () {
                MessageToast.show("Book Updated");

            }).catch(error => {
                MessageBox.error(error.message);
            })

            oEvent.getSource().getParent().getItems().forEach(item => item.setVisible(!item.getVisible()));
        },
        onDeleteRow (oEvent){
            const oCtx = oEvent.getSource().getBindingContext();
            const oModel = oCtx.getModel();
            const oRowObj = oCtx.getObject();

            MessageBox.confirm(
                `Delete Book ${oRowObj.title} (ID: ${oRowObj.ID})?`,
                {
                    actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose : function (sAction){
                        if(sAction === sap.m.MessageBox.Action.OK){
                            oCtx.delete("$auto").then(function(){
                                MessageToast.show("Book Deleted");
                            }).catch(function(oError){
                                MessageBox.error("Deletion Failed"+oError.message);
                            })
                        }
                    }
                }
            )
        }
    });
});