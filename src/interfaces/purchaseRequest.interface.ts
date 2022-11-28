// To parse this data:
//
//   import { Convert, PurchaseRequestsInterface } from "./file";
//
//   const purchaseRequestsInterface = Convert.toPurchaseRequestsInterface(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface PurchaseRequestsInterface {
    DocDate:                                   Date;
    DocDueDate:                                Date;
    TaxDate:                                   Date;
    RequriedDate?:                              Date;
    DocCurrency?:                               string;
    DocRate?:                                   number;
    Comments:                                  null;
    JournalMemo?:                               null;
    Series?:                                    number;
    "odata.metadata"?:                          string;
    "odata.etag"?:                              string;
    DocEntry?:                                  number;
    DocNum?:                                    number;
    DocType:                                   string;
    HandWritten?:                               string;
    Printed?:                                   string;
    
    AttachmentEntry?:                           null;
    
    Reference1?:                                string;
    Reference2?:                                null;
    
    PaymentGroupCode?:                          null;
    DocTime?:                                   string;
    SalesPersonCode?:                           number;
    TransportationCode?:                        number;
    Confirmed?:                                 string;
    ImportFileNum?:                             null;
    SummeryType?:                               string;
    ContactPersonCode?:                         number;
    ShowSCN?:                                   string;
    
    
    PartialSupply?:                             string;
    DocObjectCode?:                             string;
    ShipToCode?:                                null;
    Indicator?:                                 null;
    FederalTaxID?:                              null;
    DiscountPercent?:                           number;
    PaymentReference?:                          null;
    CreationDate?:                              Date;
    UpdateDate?:                                Date;
    FinancialPeriod?:                           number;
    UserSign?:                                  number;
    TransNum?:                                  null;
    VatSum?:                                    number;
    VatSumSys?:                                 number;
    VatSumFc?:                                  number;
    NetProcedure?:                              string;
    DocTotalFc?:                                number;
    DocTotalSys?:                               number;
    Form1099?:                                  null;
    Box1099?:                                   null;
    RevisionPo?:                                string;
    
    CancelDate?:                                null;
    BlockDunning?:                              string;
    Submitted?:                                 string;
    Segment?:                                   number;
    PickStatus?:                                string;
    Pick?:                                      string;
    PaymentMethod?:                             null;
    PaymentBlock?:                              string;
    PaymentBlockEntry?:                         null;
    CentralBankIndicator?:                      null;
    MaximumCashDiscount?:                       string;
    Reserve?:                                   string;
    Project?:                                   null;
    ExemptionValidityDateFrom?:                 null;
    ExemptionValidityDateTo?:                   null;
    WareHouseUpdateType?:                       string;
    Rounding?:                                  string;
    ExternalCorrectedDocNum?:                   null;
    InternalCorrectedDocNum?:                   null;
    NextCorrectingDocument?:                    null;
    DeferredTax?:                               null;
    TaxExemptionLetterNum?:                     null;
    WTApplied?:                                 number;
    WTAppliedFC?:                               number;
    BillOfExchangeReserved?:                    string;
    AgentCode?:                                 null;
    WTAppliedSC?:                               number;
    TotalEqualizationTax?:                      number;
    TotalEqualizationTaxFC?:                    number;
    TotalEqualizationTaxSC?:                    number;
    NumberOfInstallments?:                      number;
    ApplyTaxOnFirstInstallment?:                string;
    WTNonSubjectAmount?:                        number;
    WTNonSubjectAmountSC?:                      number;
    WTNonSubjectAmountFC?:                      number;
    WTExemptedAmount?:                          number;
    WTExemptedAmountSC?:                        number;
    WTExemptedAmountFC?:                        number;
    BaseAmount?:                                number;
    BaseAmountSC?:                              number;
    BaseAmountFC?:                              number;
    WTAmount?:                                  number;
    WTAmountSC?:                                number;
    WTAmountFC?:                                number;
    VatDate?:                                   null;
    DocumentsOwner?:                            null;
    FolioPrefixString?:                         null;
    FolioNumber?:                               null;
    DocumentSubType?:                           string;
    BPChannelCode?:                             null;
    BPChannelContact?:                          null;
    Address2?:                                  string;
    DocumentStatus?:                            string;
    PeriodIndicator?:                           string;
    PayToCode?:                                 null;
    ManualNumber?:                              null;
    UseShpdGoodsAct?:                           string;
    IsPayToBank?:                               null;
    PayToBankCountry?:                          null;
    PayToBankCode?:                             null;
    PayToBankAccountNo?:                        null;
    PayToBankBranch?:                           null;
    BPL_IDAssignedToInvoice?:                   null;
    DownPayment?:                               number;
    ReserveInvoice?:                            string;
    LanguageCode?:                              null;
    TrackingNumber?:                            null;
    PickRemark?:                                null;
    ClosingDate?:                               null;
    SequenceCode?:                              null;
    SequenceSerial?:                            null;
    SeriesString?:                              null;
    SubSeriesString?:                           null;
    SequenceModel?:                             string;
    UseCorrectionVATGroup?:                     string;
    TotalDiscount?:                             number;
    DownPaymentAmount?:                         number;
    DownPaymentPercentage?:                     number;
    DownPaymentType?:                           string;
    DownPaymentAmountSC?:                       number;
    DownPaymentAmountFC?:                       number;
    VatPercent?:                                number;
    ServiceGrossProfitPercent?:                 number;
    OpeningRemarks?:                            null;
    ClosingRemarks?:                            null;
    RoundingDiffAmount?:                        number;
    RoundingDiffAmountFC?:                      number;
    RoundingDiffAmountSC?:                      number;
    Cancelled?:                                 string;
    SignatureInputMessage?:                     null;
    SignatureDigest?:                           null;
    CertificationNumber?:                       null;
    PrivateKeyVersion?:                         null;
    ControlAccount?:                            string;
    InsuranceOperation347?:                     string;
    ArchiveNonremovableSalesQuotation?:         string;
    GTSChecker?:                                null;
    GTSPayee?:                                  null;
    ExtraMonth?:                                number;
    ExtraDays?:                                 number;
    CashDiscountDateOffset?:                    number;
    StartFrom?:                                 string;
    NTSApproved?:                               string;
    ETaxWebSite?:                               null;
    ETaxNumber?:                                null;
    NTSApprovedNumber?:                         null;
    EDocGenerationType?:                        string;
    EDocSeries?:                                null;
    EDocNum?:                                   null;
    EDocExportFormat?:                          null;
    EDocStatus?:                                string;
    EDocErrorCode?:                             null;
    EDocErrorMessage?:                          null;
    DownPaymentStatus?:                         string;
    GroupSeries?:                               null;
    GroupNumber?:                               null;
    GroupHandWritten?:                          string;
    ReopenOriginalDocument?:                    null;
    ReopenManuallyClosedOrCanceledDocument?:    null;
    CreateOnlineQuotation?:                     string;
    POSEquipmentNumber?:                        null;
    POSManufacturerSerialNumber?:               null;
    POSCashierNumber?:                          null;
    ApplyCurrentVATRatesForDownPaymentsToDraw?: string;
    ClosingOption?:                             string;
    SpecifiedClosingDate?:                      null;
    OpenForLandedCosts?:                        string;
    AuthorizationStatus?:                       string;
    TotalDiscountFC?:                           number;
    TotalDiscountSC?:                           number;
    RelevantToGTS?:                             string;
    BPLName?:                                   null;
    VATRegNum?:                                 null;
    AnnualInvoiceDeclarationReference?:         null;
    Supplier?:                                  null;
    Releaser?:                                  null;
    Receiver?:                                  null;
    BlanketAgreementNumber?:                    null;
    IsAlteration?:                              string;
    CancelStatus?:                              string;
    AssetValueDate?:                            null;
    Requester?:                                 string;
    RequesterName?:                             string;
    RequesterBranch?:                           number;
    RequesterDepartment?:                       number;
    RequesterEmail?:                            null;
    SendNotification?:                          string;
    ReqType?:                                   number;
    DocumentDelivery?:                          string;
    AuthorizationCode?:                         null;
    StartDeliveryDate?:                         null;
    StartDeliveryTime?:                         null;
    EndDeliveryDate?:                           null;
    EndDeliveryTime?:                           null;
    VehiclePlate?:                              null;
    ATDocumentType?:                            null;
    ElecCommStatus?:                            null;
    ElecCommMessage?:                           null;
    ReuseDocumentNum?:                          string;
    ReuseNotaFiscalNum?:                        string;
    PrintSEPADirect?:                           string;
    FiscalDocNum?:                              null;
    POSDailySummaryNo?:                         null;
    POSReceiptNo?:                              null;
    PointOfIssueCode?:                          null;
    Letter?:                                    null;
    FolioNumberFrom?:                           null;
    FolioNumberTo?:                             null;
    InterimType?:                               string;
    RelatedType?:                               number;
    RelatedEntry?:                              null;
    SAPPassport?:                               null;
    DocumentTaxID?:                             null;
    DateOfReportingControlStatementVAT?:        null;
    ReportingSectionControlStatementVAT?:       null;
    ExcludeFromTaxReportControlStatementVAT?:   string;
    POS_CashRegister?:                          null;
    UpdateTime?:                                string;
    CreateQRCodeFrom?:                          null;
    PriceMode?:                                 null;
    ShipFrom?:                                  null;
    CommissionTrade?:                           string;
    CommissionTradeReturn?:                     string;
    UseBillToAddrToDetermineTax?:               null;
    Cig?:                                       null;
    Cup?:                                       null;
    FatherCard?:                                null;
    FatherType?:                                string;
    ShipState?:                                 null;
    ShipPlace?:                                 null;
    CustOffice?:                                null;
    FCI?:                                       null;
    AddLegIn?:                                  null;
    LegTextF?:                                  null;
    DANFELgTxt?:                                null;
    DataVersion?:                               number;
    LastPageFolioNumber?:                       null;
    U_HBT_Tercero?:                             null;
    U_HBT_DocEntryNcCap?:                       null;
    U_HBT_Maquina?:                             null;
    U_HBT_AutRet?:                              null;
    U_HBT_AreVal?:                              string;
    U_HBT_Independ?:                            null;
    U_HBT_AjusteCartera?:                       null;
    U_HBT_Impreso?:                             string;
    U_HBT_ClienteDif?:                          null;
    U_HBT_TipoFactura?:                         null;
    U_HBT_MedPag?:                              null;
    U_HBT_CondEntre?:                           null;
    U_HBT_CodDescuentos?:                       null;
    U_HBT_RazonDescuento?:                      null;
    U_HBT_DocNoTributar?:                       string;
    U_HBT_Mand_Contrato?:                       null;
    U_HBT_Tipo_Operacion?:                      string;
    U_HBT_IdFacturaDif?:                        null;
    U_HBT_CuentaIngDif?:                        null;
    U_HBT_SaldoAplicado?:                       string;
    U_SCGM_Status?:                             string;
    U_HBT_EstadoCE?:                            null;
    U_HBT_DetalleEstado?:                       null;
    U_HBT_FechaEnvCE?:                          null;
    U_HBT_FechaAceCE?:                          null;
    U_HBT_GUID?:                                null;
    U_HBT_ClaveAcceso?:                         null;
    U_HBT_NombreArcXMLCE?:                      null;
    U_HBT_VisorPublico?:                        null;
    U_HBT_IdEnProveedor?:                       null;
    U_HBT_Autorizacion?:                        null;
    U_HBT_DocNumEnviado?:                       null;
    U_HBT_MailSocio?:                           null;
    U_ReceiptDocumentRef?:                      null;
    U_HBT_ResCodigo?:                           null;
    U_HBT_ResDesLarga?:                         null;
    U_HBT_IdFactura?:                           null;
    U_HBT_ConceptoNC?:                          null;
    U_HBT_ConceptoND?:                          null;
    U_HBT_EstadoDIAN?:                          number;
    U_HBT_EstadoEntrega?:                       number;
    U_HBT_ReceiptLineRef?:                      null;
    U_HBT_ReceiptDocUBL?:                       null;
    U_HBT_FE_Ref?:                              null;
    U_HBT_Serie_Ref?:                           null;
    U_HBT_FecOrdenCompra?:                      null;
    U_HBT_SinStock?:                            string;
    U_HBT_Estado?:                              null;
    U_HBT_Contrato?:                            null;
    U_HBT_IdMasivo?:                            null;
    U_HBT_FecEntEfec?:                          null;
    U_HBT_IdPreNum?:                            null;
    U_HBT_IdTranComfiar?:                       null;
    U_IFRS_DCOBRO?:                             string;
    U_NF_ALDESFINAL?:                           null;
    U_NF_AutCargue?:                            null;
    U_NF_PlanillaTrans?:                        null;
    U_NF_Transportadora?:                       null;
    U_NF_Placa?:                                null;
    U_NF_IdConductor?:                          null;
    U_NF_Tara?:                                 number;
    U_NF_PesoCarga?:                            number;
    U_NT_verincoterm?:                          null;
    U_NT_Incoterms?:                            null;
    U_U_NT_verincoterm?:                        null;
    U_NF_MOTNOTA?:                              null;
    U_NF_NOMCONDUC?:                            null;
    U_NF_DESTINO?:                              string;
    U_NF_CONDTRANS?:                            null;
    U_NF_PEDCONTIG?:                            null;
    U_NF_REMICONTIG?:                           null;
    U_NF_DEPEN_SOLPED?:                         null;
    U_HBT_CausaCorrecion?:                      null;
    U_NTF_CONS_PAGO?:                           null;
    U_NTF_FECH_CONS_PAGO?:                      null;
    U_RECFACT?:                                 null;
    U_NF_FACTURAFPP?:                           null;
    Document_ApprovalRequests?:                 any[];
    DocumentLines:                             DocumentLine[];
    ElectronicProtocols?:                       any[];
    DocumentSpecialLines?:                      any[];
    TaxExtension?:                              TaxExtension;
    AddressExtension?:                          AddressExtension;
    DocumentReferences?:                        any[];
    U_AUTOR_PORTAL: string;
    U_NF_STATUS?: string;
    U_NF_LASTSHIPPPING?:string;
    U_NF_DATEOFSHIPPING?:string;
    U_NF_AGENTE?:string;
    U_NF_PAGO?:string;
    U_NF_TIPOCARGA?:string;
    U_NF_PUERTOSALIDA?:string;
    U_NF_MOTONAVE?:string;
    U_NF_PEDMP?:string;
}

export interface AddressExtension {
    ShipToStreet?:                 string;
    ShipToStreetNo?:               string;
    ShipToBlock?:                  null;
    ShipToBuilding?:               null;
    ShipToCity?:                   string;
    ShipToZipCode?:                string;
    ShipToCounty?:                 null;
    ShipToState?:                  string;
    ShipToCountry?:                string;
    ShipToAddressType?:            null;
    BillToStreet?:                 null;
    BillToStreetNo?:               null;
    BillToBlock?:                  null;
    BillToBuilding?:               null;
    BillToCity?:                   null;
    BillToZipCode?:                null;
    BillToCounty?:                 null;
    BillToState?:                  null;
    BillToCountry?:                null;
    BillToAddressType?:            null;
    ShipToGlobalLocationNumber?:   string;
    BillToGlobalLocationNumber?:   null;
    ShipToAddress2?:               null;
    ShipToAddress3?:               null;
    BillToAddress2?:               null;
    BillToAddress3?:               null;
    PlaceOfSupply?:                null;
    PurchasePlaceOfSupply?:        null;
    DocEntry?:                     number;
    GoodsIssuePlaceBP?:            null;
    GoodsIssuePlaceCNPJ?:          null;
    GoodsIssuePlaceCPF?:           null;
    GoodsIssuePlaceStreet?:        null;
    GoodsIssuePlaceStreetNo?:      null;
    GoodsIssuePlaceBuilding?:      null;
    GoodsIssuePlaceZip?:           null;
    GoodsIssuePlaceBlock?:         null;
    GoodsIssuePlaceCity?:          null;
    GoodsIssuePlaceCounty?:        null;
    GoodsIssuePlaceState?:         null;
    GoodsIssuePlaceCountry?:       null;
    GoodsIssuePlacePhone?:         null;
    GoodsIssuePlaceEMail?:         null;
    GoodsIssuePlaceDepartureDate?: null;
    DeliveryPlaceBP?:              null;
    DeliveryPlaceCNPJ?:            null;
    DeliveryPlaceCPF?:             null;
    DeliveryPlaceStreet?:          null;
    DeliveryPlaceStreetNo?:        null;
    DeliveryPlaceBuilding?:        null;
    DeliveryPlaceZip?:             null;
    DeliveryPlaceBlock?:           null;
    DeliveryPlaceCity?:            null;
    DeliveryPlaceCounty?:          null;
    DeliveryPlaceState?:           null;
    DeliveryPlaceCountry?:         null;
    DeliveryPlacePhone?:           null;
    DeliveryPlaceEMail?:           null;
    DeliveryPlaceDepartureDate?:   null;
    U_HBT_MunMedS?:                null;
    U_HBT_MunMedB?:                null;
    U_HBT_DirMMS?:                 string;
    U_HBT_DirMMB?:                 string;
}

export interface DocumentLine {
    LineNum:                              number;
    ItemCode?:                             null;
    ItemDescription?:                      string;
    Quantity?:                             number;
    ShipDate?:                             null;
    Price?:                                number;
    PriceAfterVAT?:                        number;
    Currency:                             string;
    Rate?:                                 number;
    DiscountPercent?:                      number;
    VendorNum?:                            null;
    SerialNum?:                            null;
    WarehouseCode?:                        string;
    SalesPersonCode?:                      number;
    CommisionPercent?:                     number;
    TreeType?:                             string;
    AccountCode?:                          string;
    UseBaseUnits?:                         string;
    SupplierCatNum?:                       null;
    CostingCode?:                          string;
    ProjectCode?:                          string;
    BarCode?:                              null;
    VatGroup?:                             string;
    Height1?:                              number;
    Hight1Unit?:                           null;
    Height2?:                              number;
    Height2Unit?:                          null;
    Lengh1?:                               number;
    Lengh1Unit?:                           null;
    Lengh2?:                               number;
    Lengh2Unit?:                           null;
    Weight1?:                              number;
    Weight1Unit?:                          null;
    Weight2?:                              number;
    Weight2Unit?:                          null;
    Factor1?:                              number;
    Factor2?:                              number;
    Factor3?:                              number;
    Factor4?:                              number;
    BaseType?:                             number;
    BaseEntry?:                            null;
    BaseLine?:                             null;
    Volume?:                               number;
    VolumeUnit?:                           null;
    Width1?:                               number;
    Width1Unit?:                           null;
    Width2?:                               number;
    Width2Unit?:                           null;
    Address?:                              string;
    TaxCode?:                              string;
    TaxType?:                              string;
    TaxLiable?:                            string;
    PickStatus?:                           string;
    PickQuantity?:                         number;
    PickListIdNumber?:                     null;
    OriginalItem?:                         null;
    BackOrder?:                            null;
    FreeText?:                             null;
    ShippingMethod?:                       number;
    POTargetNum?:                          null;
    POTargetEntry?:                        null;
    POTargetRowNum?:                       null;
    CorrectionInvoiceItem?:                string;
    CorrInvAmountToStock?:                 number;
    CorrInvAmountToDiffAcct?:              number;
    AppliedTax?:                           number;
    AppliedTaxFC?:                         number;
    AppliedTaxSC?:                         number;
    WTLiable?:                             string;
    DeferredTax?:                          string;
    EqualizationTaxPercent?:               number;
    TotalEqualizationTax?:                 number;
    TotalEqualizationTaxFC?:               number;
    TotalEqualizationTaxSC?:               number;
    NetTaxAmount?:                         number;
    NetTaxAmountFC?:                       number;
    NetTaxAmountSC?:                       number;
    MeasureUnit?:                          null;
    UnitsOfMeasurment?:                    number;
    LineTotal?:                            number;
    TaxPercentagePerRow?:                  number;
    TaxTotal?:                             number;
    ConsumerSalesForecast?:                null;
    ExciseAmount?:                         number;
    TaxPerUnit?:                           number;
    TotalInclTax?:                         number;
    CountryOrg?:                           null;
    SWW?:                                  null;
    TransactionType?:                      null;
    DistributeExpense?:                    string;
    RowTotalFC?:                           number;
    RowTotalSC?:                           number;
    LastBuyInmPrice?:                      number;
    LastBuyDistributeSumFc?:               number;
    LastBuyDistributeSumSc?:               number;
    LastBuyDistributeSum?:                 number;
    StockDistributesumForeign?:            number;
    StockDistributesumSystem?:             number;
    StockDistributesum?:                   number;
    StockInmPrice?:                        number;
    PickStatusEx?:                         string;
    TaxBeforeDPM?:                         number;
    TaxBeforeDPMFC?:                       number;
    TaxBeforeDPMSC?:                       number;
    CFOPCode?:                             null;
    CSTCode?:                              null;
    Usage?:                                null;
    TaxOnly?:                              string;
    VisualOrder?:                          number;
    BaseOpenQuantity?:                     number;
    UnitPrice?:                            number;
    LineStatus?:                           string;
    PackageQuantity?:                      number;
    Text?:                                 null;
    LineType?:                             string;
    COGSCostingCode?:                      null;
    COGSAccountCode?:                      null;
    ChangeAssemlyBoMWarehouse?:            null;
    GrossBuyPrice?:                        number;
    GrossBase?:                            null;
    GrossProfitTotalBasePrice?:            number;
    CostingCode2?:                         string;
    CostingCode3?:                         string;
    CostingCode4?:                         null;
    CostingCode5?:                         null;
    ItemDetails?:                          null;
    LocationCode?:                         null;
    ActualDeliveryDate?:                   null;
    RemainingOpenQuantity?:                number;
    OpenAmount?:                           number;
    OpenAmountFC?:                         number;
    OpenAmountSC?:                         number;
    ExLineNo?:                             null;
    RequiredDate?:                         Date;
    RequiredQuantity?:                     number;
    COGSCostingCode2?:                     null;
    COGSCostingCode3?:                     null;
    COGSCostingCode4?:                     null;
    COGSCostingCode5?:                     null;
    CSTforIPI?:                            null;
    CSTforPIS?:                            null;
    CSTforCOFINS?:                         null;
    CreditOriginCode?:                     null;
    WithoutInventoryMovement?:             string;
    AgreementNo?:                          null;
    AgreementRowNumber?:                   null;
    ActualBaseEntry?:                      null;
    ActualBaseLine?:                       null;
    DocEntry?:                             number;
    Surpluses?:                            number;
    DefectAndBreakup?:                     number;
    Shortages?:                            number;
    ConsiderQuantity?:                     string;
    PartialRetirement?:                    string;
    RetirementQuantity?:                   number;
    RetirementAPC?:                        number;
    ThirdParty?:                           string;
    PoNum?:                                null;
    PoItmNum?:                             null;
    ExpenseType?:                          null;
    ReceiptNumber?:                        null;
    ExpenseOperationType?:                 null;
    FederalTaxID?:                         null;
    GrossProfit?:                          number;
    GrossProfitFC?:                        number;
    GrossProfitSC?:                        number;
    PriceSource?:                          string;
    LineVendor?:                           string;
    StgSeqNum?:                            null;
    StgEntry?:                             null;
    StgDesc?:                              null;
    UoMEntry?:                             number;
    UoMCode?:                              null;
    InventoryQuantity?:                    number;
    RemainingOpenInventoryQuantity?:       number;
    ParentLineNum?:                        null;
    Incoterms?:                            number;
    TransportMode?:                        number;
    NatureOfTransaction?:                  null;
    DestinationCountryForImport?:          null;
    DestinationRegionForImport?:           null;
    OriginCountryForExport?:               null;
    OriginRegionForExport?:                null;
    ItemType?:                             string;
    ChangeInventoryQuantityIndependently?: string;
    FreeOfChargeBP?:                       string;
    SACEntry?:                             null;
    HSNEntry?:                             null;
    GrossPrice?:                           number;
    GrossTotal?:                           number;
    GrossTotalFC?:                         number;
    GrossTotalSC?:                         number;
    NCMCode?:                              number;
    NVECode?:                              null;
    IndEscala?:                            string;
    CtrSealQty?:                           number;
    CNJPMan?:                              null;
    CESTCode?:                             null;
    UFFiscalBenefitCode?:                  null;
    ReverseCharge?:                        string;
    ShipFromCode?:                         null;
    ShipFromDescription?:                  null;
    StandardItemIdentification?:           null;
    CommodityClassification?:              null;
    UnencumberedReason?:                   null;
    CUSplit?:                              string;
    U_HBT_CONC_ENTINV?:                    null;
    U_HBT_CONC_SALINV?:                    null;
    U_HBT_ConDif?:                         null;
    U_HBT_DocEntryCap?:                    null;
    U_HBT_Mand_Contrato?:                  null;
    U_HBT_Mand_FCont?:                     null;
    U_HBT_Mand_1?:                         null;
    U_HBT_Mand_2?:                         null;
    U_HBT_MatMer_1?:                       null;
    U_HBT_MatMer_2?:                       null;
    U_HBT_Mand_PNRL?:                      null;
    U_HBT_Mand_SNRL?:                      null;
    U_HBT_Mand_ARL?:                       null;
    U_HBT_Imprimir?:                       string;
    U_HBT_Descripcion?:                    null;
    U_HBT_Valor?:                          number;
    U_HBT_ConceptoDife?:                   null;
    U_HBT_TipoPrecioRef?:                  string;
    U_HBT_BaseInstalada?:                  null;
    U_HBT_VigDesde?:                       null;
    U_HBT_VigHasta?:                       null;
    U_HBT_CuotasDif?:                      number;
    U_HBT_DigVerMan?:                      null;
    U_HBT_TipDocMan?:                      null;
    U_HBT_RazonDescuento?:                 null;
    U_HBT_Cantidad?:                       number;
    U_HBT_UndMedida?:                      null;
    U_HBT_TipoIngreso?:                    null;
    U_HBT_CodArticulo?:                    null;
    U_NF_EMISION?:                         null;
    U_NF_ACUERDO?:                         null;
    LineTaxJurisdictions?:                 any[];
    DocumentLineAdditionalExpenses?:       any[];
    U_ID_PORTAL?:   any;
    U_NF_NOM_AUT_PORTAL?:string;
}

export interface TaxExtension {
    TaxId0?:                  null;
    TaxId1?:                  null;
    TaxId2?:                  null;
    TaxId3?:                  null;
    TaxId4?:                  null;
    TaxId5?:                  null;
    TaxId6?:                  null;
    TaxId7?:                  null;
    TaxId8?:                  null;
    TaxId9?:                  null;
    State?:                   null;
    County?:                  null;
    Incoterms?:               null;
    Vehicle?:                 null;
    VehicleState?:            null;
    NFRef?:                   null;
    Carrier?:                 null;
    PackQuantity?:            null;
    PackDescription?:         null;
    Brand?:                   null;
    ShipUnitNo?:              null;
    NetWeight?:               number;
    GrossWeight?:             number;
    StreetS?:                 string;
    BlockS?:                  null;
    BuildingS?:               null;
    CityS?:                   string;
    ZipCodeS?:                string;
    CountyS?:                 null;
    StateS?:                  string;
    CountryS?:                string;
    StreetB?:                 null;
    BlockB?:                  null;
    BuildingB?:               null;
    CityB?:                   null;
    ZipCodeB?:                null;
    CountyB?:                 null;
    StateB?:                  null;
    CountryB?:                null;
    ImportOrExport?:          null;
    MainUsage?:               null;
    GlobalLocationNumberS?:   string;
    GlobalLocationNumberB?:   null;
    TaxId12?:                 null;
    TaxId13?:                 null;
    BillOfEntryNo?:           null;
    BillOfEntryDate?:         null;
    OriginalBillOfEntryNo?:   null;
    OriginalBillOfEntryDate?: null;
    ImportOrExportType?:      string;
    PortCode?:                null;
    DocEntry?:                number;
    BoEValue?:                number;
    ClaimRefund?:             null;
    DifferentialOfTaxRate?:   null;
    IsIGSTAccount?:           string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toPurchaseRequestsInterface(json: string): PurchaseRequestsInterface {
        return cast(JSON.parse(json), r("PurchaseRequestsInterface"));
    }

    public static purchaseRequestsInterfaceToJson(value: PurchaseRequestsInterface): string {
        return JSON.stringify(uncast(value, r("PurchaseRequestsInterface")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "PurchaseRequestsInterface": o([
        { json: "odata.metadata", js: "odata.metadata", typ: "" },
        { json: "odata.etag", js: "odata.etag", typ: "" },
        { json: "DocEntry", js: "DocEntry", typ: 0 },
        { json: "DocNum", js: "DocNum", typ: 0 },
        { json: "DocType", js: "DocType", typ: "" },
        { json: "HandWritten", js: "HandWritten", typ: "" },
        { json: "Printed", js: "Printed", typ: "" },
        { json: "DocDate", js: "DocDate", typ: Date },
        { json: "DocDueDate", js: "DocDueDate", typ: Date },
        { json: "AttachmentEntry", js: "AttachmentEntry", typ: null },
        { json: "DocCurrency", js: "DocCurrency", typ: "" },
        { json: "DocRate", js: "DocRate", typ: 0 },
        { json: "Reference1", js: "Reference1", typ: "" },
        { json: "Reference2", js: "Reference2", typ: null },
        { json: "Comments", js: "Comments", typ: null },
        { json: "JournalMemo", js: "JournalMemo", typ: null },
        { json: "PaymentGroupCode", js: "PaymentGroupCode", typ: null },
        { json: "DocTime", js: "DocTime", typ: "" },
        { json: "SalesPersonCode", js: "SalesPersonCode", typ: 0 },
        { json: "TransportationCode", js: "TransportationCode", typ: 0 },
        { json: "Confirmed", js: "Confirmed", typ: "" },
        { json: "ImportFileNum", js: "ImportFileNum", typ: null },
        { json: "SummeryType", js: "SummeryType", typ: "" },
        { json: "ContactPersonCode", js: "ContactPersonCode", typ: 0 },
        { json: "ShowSCN", js: "ShowSCN", typ: "" },
        { json: "Series", js: "Series", typ: 0 },
        { json: "TaxDate", js: "TaxDate", typ: Date },
        { json: "PartialSupply", js: "PartialSupply", typ: "" },
        { json: "DocObjectCode", js: "DocObjectCode", typ: "" },
        { json: "ShipToCode", js: "ShipToCode", typ: null },
        { json: "Indicator", js: "Indicator", typ: null },
        { json: "FederalTaxID", js: "FederalTaxID", typ: null },
        { json: "DiscountPercent", js: "DiscountPercent", typ: 0 },
        { json: "PaymentReference", js: "PaymentReference", typ: null },
        { json: "CreationDate", js: "CreationDate", typ: Date },
        { json: "UpdateDate", js: "UpdateDate", typ: Date },
        { json: "FinancialPeriod", js: "FinancialPeriod", typ: 0 },
        { json: "UserSign", js: "UserSign", typ: 0 },
        { json: "TransNum", js: "TransNum", typ: null },
        { json: "VatSum", js: "VatSum", typ: 0 },
        { json: "VatSumSys", js: "VatSumSys", typ: 0 },
        { json: "VatSumFc", js: "VatSumFc", typ: 0 },
        { json: "NetProcedure", js: "NetProcedure", typ: "" },
        { json: "DocTotalFc", js: "DocTotalFc", typ: 0 },
        { json: "DocTotalSys", js: "DocTotalSys", typ: 3.14 },
        { json: "Form1099", js: "Form1099", typ: null },
        { json: "Box1099", js: "Box1099", typ: null },
        { json: "RevisionPo", js: "RevisionPo", typ: "" },
        { json: "RequriedDate", js: "RequriedDate", typ: Date },
        { json: "CancelDate", js: "CancelDate", typ: null },
        { json: "BlockDunning", js: "BlockDunning", typ: "" },
        { json: "Submitted", js: "Submitted", typ: "" },
        { json: "Segment", js: "Segment", typ: 0 },
        { json: "PickStatus", js: "PickStatus", typ: "" },
        { json: "Pick", js: "Pick", typ: "" },
        { json: "PaymentMethod", js: "PaymentMethod", typ: null },
        { json: "PaymentBlock", js: "PaymentBlock", typ: "" },
        { json: "PaymentBlockEntry", js: "PaymentBlockEntry", typ: null },
        { json: "CentralBankIndicator", js: "CentralBankIndicator", typ: null },
        { json: "MaximumCashDiscount", js: "MaximumCashDiscount", typ: "" },
        { json: "Reserve", js: "Reserve", typ: "" },
        { json: "Project", js: "Project", typ: null },
        { json: "ExemptionValidityDateFrom", js: "ExemptionValidityDateFrom", typ: null },
        { json: "ExemptionValidityDateTo", js: "ExemptionValidityDateTo", typ: null },
        { json: "WareHouseUpdateType", js: "WareHouseUpdateType", typ: "" },
        { json: "Rounding", js: "Rounding", typ: "" },
        { json: "ExternalCorrectedDocNum", js: "ExternalCorrectedDocNum", typ: null },
        { json: "InternalCorrectedDocNum", js: "InternalCorrectedDocNum", typ: null },
        { json: "NextCorrectingDocument", js: "NextCorrectingDocument", typ: null },
        { json: "DeferredTax", js: "DeferredTax", typ: null },
        { json: "TaxExemptionLetterNum", js: "TaxExemptionLetterNum", typ: null },
        { json: "WTApplied", js: "WTApplied", typ: 0 },
        { json: "WTAppliedFC", js: "WTAppliedFC", typ: 0 },
        { json: "BillOfExchangeReserved", js: "BillOfExchangeReserved", typ: "" },
        { json: "AgentCode", js: "AgentCode", typ: null },
        { json: "WTAppliedSC", js: "WTAppliedSC", typ: 0 },
        { json: "TotalEqualizationTax", js: "TotalEqualizationTax", typ: 0 },
        { json: "TotalEqualizationTaxFC", js: "TotalEqualizationTaxFC", typ: 0 },
        { json: "TotalEqualizationTaxSC", js: "TotalEqualizationTaxSC", typ: 0 },
        { json: "NumberOfInstallments", js: "NumberOfInstallments", typ: 0 },
        { json: "ApplyTaxOnFirstInstallment", js: "ApplyTaxOnFirstInstallment", typ: "" },
        { json: "WTNonSubjectAmount", js: "WTNonSubjectAmount", typ: 0 },
        { json: "WTNonSubjectAmountSC", js: "WTNonSubjectAmountSC", typ: 0 },
        { json: "WTNonSubjectAmountFC", js: "WTNonSubjectAmountFC", typ: 0 },
        { json: "WTExemptedAmount", js: "WTExemptedAmount", typ: 0 },
        { json: "WTExemptedAmountSC", js: "WTExemptedAmountSC", typ: 0 },
        { json: "WTExemptedAmountFC", js: "WTExemptedAmountFC", typ: 0 },
        { json: "BaseAmount", js: "BaseAmount", typ: 0 },
        { json: "BaseAmountSC", js: "BaseAmountSC", typ: 0 },
        { json: "BaseAmountFC", js: "BaseAmountFC", typ: 0 },
        { json: "WTAmount", js: "WTAmount", typ: 0 },
        { json: "WTAmountSC", js: "WTAmountSC", typ: 0 },
        { json: "WTAmountFC", js: "WTAmountFC", typ: 0 },
        { json: "VatDate", js: "VatDate", typ: null },
        { json: "DocumentsOwner", js: "DocumentsOwner", typ: null },
        { json: "FolioPrefixString", js: "FolioPrefixString", typ: null },
        { json: "FolioNumber", js: "FolioNumber", typ: null },
        { json: "DocumentSubType", js: "DocumentSubType", typ: "" },
        { json: "BPChannelCode", js: "BPChannelCode", typ: null },
        { json: "BPChannelContact", js: "BPChannelContact", typ: null },
        { json: "Address2", js: "Address2", typ: "" },
        { json: "DocumentStatus", js: "DocumentStatus", typ: "" },
        { json: "PeriodIndicator", js: "PeriodIndicator", typ: "" },
        { json: "PayToCode", js: "PayToCode", typ: null },
        { json: "ManualNumber", js: "ManualNumber", typ: null },
        { json: "UseShpdGoodsAct", js: "UseShpdGoodsAct", typ: "" },
        { json: "IsPayToBank", js: "IsPayToBank", typ: null },
        { json: "PayToBankCountry", js: "PayToBankCountry", typ: null },
        { json: "PayToBankCode", js: "PayToBankCode", typ: null },
        { json: "PayToBankAccountNo", js: "PayToBankAccountNo", typ: null },
        { json: "PayToBankBranch", js: "PayToBankBranch", typ: null },
        { json: "BPL_IDAssignedToInvoice", js: "BPL_IDAssignedToInvoice", typ: null },
        { json: "DownPayment", js: "DownPayment", typ: 0 },
        { json: "ReserveInvoice", js: "ReserveInvoice", typ: "" },
        { json: "LanguageCode", js: "LanguageCode", typ: null },
        { json: "TrackingNumber", js: "TrackingNumber", typ: null },
        { json: "PickRemark", js: "PickRemark", typ: null },
        { json: "ClosingDate", js: "ClosingDate", typ: null },
        { json: "SequenceCode", js: "SequenceCode", typ: null },
        { json: "SequenceSerial", js: "SequenceSerial", typ: null },
        { json: "SeriesString", js: "SeriesString", typ: null },
        { json: "SubSeriesString", js: "SubSeriesString", typ: null },
        { json: "SequenceModel", js: "SequenceModel", typ: "" },
        { json: "UseCorrectionVATGroup", js: "UseCorrectionVATGroup", typ: "" },
        { json: "TotalDiscount", js: "TotalDiscount", typ: 0 },
        { json: "DownPaymentAmount", js: "DownPaymentAmount", typ: 0 },
        { json: "DownPaymentPercentage", js: "DownPaymentPercentage", typ: 0 },
        { json: "DownPaymentType", js: "DownPaymentType", typ: "" },
        { json: "DownPaymentAmountSC", js: "DownPaymentAmountSC", typ: 0 },
        { json: "DownPaymentAmountFC", js: "DownPaymentAmountFC", typ: 0 },
        { json: "VatPercent", js: "VatPercent", typ: 0 },
        { json: "ServiceGrossProfitPercent", js: "ServiceGrossProfitPercent", typ: 0 },
        { json: "OpeningRemarks", js: "OpeningRemarks", typ: null },
        { json: "ClosingRemarks", js: "ClosingRemarks", typ: null },
        { json: "RoundingDiffAmount", js: "RoundingDiffAmount", typ: 0 },
        { json: "RoundingDiffAmountFC", js: "RoundingDiffAmountFC", typ: 0 },
        { json: "RoundingDiffAmountSC", js: "RoundingDiffAmountSC", typ: 0 },
        { json: "Cancelled", js: "Cancelled", typ: "" },
        { json: "SignatureInputMessage", js: "SignatureInputMessage", typ: null },
        { json: "SignatureDigest", js: "SignatureDigest", typ: null },
        { json: "CertificationNumber", js: "CertificationNumber", typ: null },
        { json: "PrivateKeyVersion", js: "PrivateKeyVersion", typ: null },
        { json: "ControlAccount", js: "ControlAccount", typ: "" },
        { json: "InsuranceOperation347", js: "InsuranceOperation347", typ: "" },
        { json: "ArchiveNonremovableSalesQuotation", js: "ArchiveNonremovableSalesQuotation", typ: "" },
        { json: "GTSChecker", js: "GTSChecker", typ: null },
        { json: "GTSPayee", js: "GTSPayee", typ: null },
        { json: "ExtraMonth", js: "ExtraMonth", typ: 0 },
        { json: "ExtraDays", js: "ExtraDays", typ: 0 },
        { json: "CashDiscountDateOffset", js: "CashDiscountDateOffset", typ: 0 },
        { json: "StartFrom", js: "StartFrom", typ: "" },
        { json: "NTSApproved", js: "NTSApproved", typ: "" },
        { json: "ETaxWebSite", js: "ETaxWebSite", typ: null },
        { json: "ETaxNumber", js: "ETaxNumber", typ: null },
        { json: "NTSApprovedNumber", js: "NTSApprovedNumber", typ: null },
        { json: "EDocGenerationType", js: "EDocGenerationType", typ: "" },
        { json: "EDocSeries", js: "EDocSeries", typ: null },
        { json: "EDocNum", js: "EDocNum", typ: null },
        { json: "EDocExportFormat", js: "EDocExportFormat", typ: null },
        { json: "EDocStatus", js: "EDocStatus", typ: "" },
        { json: "EDocErrorCode", js: "EDocErrorCode", typ: null },
        { json: "EDocErrorMessage", js: "EDocErrorMessage", typ: null },
        { json: "DownPaymentStatus", js: "DownPaymentStatus", typ: "" },
        { json: "GroupSeries", js: "GroupSeries", typ: null },
        { json: "GroupNumber", js: "GroupNumber", typ: null },
        { json: "GroupHandWritten", js: "GroupHandWritten", typ: "" },
        { json: "ReopenOriginalDocument", js: "ReopenOriginalDocument", typ: null },
        { json: "ReopenManuallyClosedOrCanceledDocument", js: "ReopenManuallyClosedOrCanceledDocument", typ: null },
        { json: "CreateOnlineQuotation", js: "CreateOnlineQuotation", typ: "" },
        { json: "POSEquipmentNumber", js: "POSEquipmentNumber", typ: null },
        { json: "POSManufacturerSerialNumber", js: "POSManufacturerSerialNumber", typ: null },
        { json: "POSCashierNumber", js: "POSCashierNumber", typ: null },
        { json: "ApplyCurrentVATRatesForDownPaymentsToDraw", js: "ApplyCurrentVATRatesForDownPaymentsToDraw", typ: "" },
        { json: "ClosingOption", js: "ClosingOption", typ: "" },
        { json: "SpecifiedClosingDate", js: "SpecifiedClosingDate", typ: null },
        { json: "OpenForLandedCosts", js: "OpenForLandedCosts", typ: "" },
        { json: "AuthorizationStatus", js: "AuthorizationStatus", typ: "" },
        { json: "TotalDiscountFC", js: "TotalDiscountFC", typ: 0 },
        { json: "TotalDiscountSC", js: "TotalDiscountSC", typ: 0 },
        { json: "RelevantToGTS", js: "RelevantToGTS", typ: "" },
        { json: "BPLName", js: "BPLName", typ: null },
        { json: "VATRegNum", js: "VATRegNum", typ: null },
        { json: "AnnualInvoiceDeclarationReference", js: "AnnualInvoiceDeclarationReference", typ: null },
        { json: "Supplier", js: "Supplier", typ: null },
        { json: "Releaser", js: "Releaser", typ: null },
        { json: "Receiver", js: "Receiver", typ: null },
        { json: "BlanketAgreementNumber", js: "BlanketAgreementNumber", typ: null },
        { json: "IsAlteration", js: "IsAlteration", typ: "" },
        { json: "CancelStatus", js: "CancelStatus", typ: "" },
        { json: "AssetValueDate", js: "AssetValueDate", typ: null },
        { json: "Requester", js: "Requester", typ: "" },
        { json: "RequesterName", js: "RequesterName", typ: "" },
        { json: "RequesterBranch", js: "RequesterBranch", typ: 0 },
        { json: "RequesterDepartment", js: "RequesterDepartment", typ: 0 },
        { json: "RequesterEmail", js: "RequesterEmail", typ: null },
        { json: "SendNotification", js: "SendNotification", typ: "" },
        { json: "ReqType", js: "ReqType", typ: 0 },
        { json: "DocumentDelivery", js: "DocumentDelivery", typ: "" },
        { json: "AuthorizationCode", js: "AuthorizationCode", typ: null },
        { json: "StartDeliveryDate", js: "StartDeliveryDate", typ: null },
        { json: "StartDeliveryTime", js: "StartDeliveryTime", typ: null },
        { json: "EndDeliveryDate", js: "EndDeliveryDate", typ: null },
        { json: "EndDeliveryTime", js: "EndDeliveryTime", typ: null },
        { json: "VehiclePlate", js: "VehiclePlate", typ: null },
        { json: "ATDocumentType", js: "ATDocumentType", typ: null },
        { json: "ElecCommStatus", js: "ElecCommStatus", typ: null },
        { json: "ElecCommMessage", js: "ElecCommMessage", typ: null },
        { json: "ReuseDocumentNum", js: "ReuseDocumentNum", typ: "" },
        { json: "ReuseNotaFiscalNum", js: "ReuseNotaFiscalNum", typ: "" },
        { json: "PrintSEPADirect", js: "PrintSEPADirect", typ: "" },
        { json: "FiscalDocNum", js: "FiscalDocNum", typ: null },
        { json: "POSDailySummaryNo", js: "POSDailySummaryNo", typ: null },
        { json: "POSReceiptNo", js: "POSReceiptNo", typ: null },
        { json: "PointOfIssueCode", js: "PointOfIssueCode", typ: null },
        { json: "Letter", js: "Letter", typ: null },
        { json: "FolioNumberFrom", js: "FolioNumberFrom", typ: null },
        { json: "FolioNumberTo", js: "FolioNumberTo", typ: null },
        { json: "InterimType", js: "InterimType", typ: "" },
        { json: "RelatedType", js: "RelatedType", typ: 0 },
        { json: "RelatedEntry", js: "RelatedEntry", typ: null },
        { json: "SAPPassport", js: "SAPPassport", typ: null },
        { json: "DocumentTaxID", js: "DocumentTaxID", typ: null },
        { json: "DateOfReportingControlStatementVAT", js: "DateOfReportingControlStatementVAT", typ: null },
        { json: "ReportingSectionControlStatementVAT", js: "ReportingSectionControlStatementVAT", typ: null },
        { json: "ExcludeFromTaxReportControlStatementVAT", js: "ExcludeFromTaxReportControlStatementVAT", typ: "" },
        { json: "POS_CashRegister", js: "POS_CashRegister", typ: null },
        { json: "UpdateTime", js: "UpdateTime", typ: "" },
        { json: "CreateQRCodeFrom", js: "CreateQRCodeFrom", typ: null },
        { json: "PriceMode", js: "PriceMode", typ: null },
        { json: "ShipFrom", js: "ShipFrom", typ: null },
        { json: "CommissionTrade", js: "CommissionTrade", typ: "" },
        { json: "CommissionTradeReturn", js: "CommissionTradeReturn", typ: "" },
        { json: "UseBillToAddrToDetermineTax", js: "UseBillToAddrToDetermineTax", typ: null },
        { json: "Cig", js: "Cig", typ: null },
        { json: "Cup", js: "Cup", typ: null },
        { json: "FatherCard", js: "FatherCard", typ: null },
        { json: "FatherType", js: "FatherType", typ: "" },
        { json: "ShipState", js: "ShipState", typ: null },
        { json: "ShipPlace", js: "ShipPlace", typ: null },
        { json: "CustOffice", js: "CustOffice", typ: null },
        { json: "FCI", js: "FCI", typ: null },
        { json: "AddLegIn", js: "AddLegIn", typ: null },
        { json: "LegTextF", js: "LegTextF", typ: null },
        { json: "DANFELgTxt", js: "DANFELgTxt", typ: null },
        { json: "DataVersion", js: "DataVersion", typ: 0 },
        { json: "LastPageFolioNumber", js: "LastPageFolioNumber", typ: null },
        { json: "U_HBT_Tercero", js: "U_HBT_Tercero", typ: null },
        { json: "U_HBT_DocEntryNcCap", js: "U_HBT_DocEntryNcCap", typ: null },
        { json: "U_HBT_Maquina", js: "U_HBT_Maquina", typ: null },
        { json: "U_HBT_AutRet", js: "U_HBT_AutRet", typ: null },
        { json: "U_HBT_AreVal", js: "U_HBT_AreVal", typ: "" },
        { json: "U_HBT_Independ", js: "U_HBT_Independ", typ: null },
        { json: "U_HBT_AjusteCartera", js: "U_HBT_AjusteCartera", typ: null },
        { json: "U_HBT_Impreso", js: "U_HBT_Impreso", typ: "" },
        { json: "U_HBT_ClienteDif", js: "U_HBT_ClienteDif", typ: null },
        { json: "U_HBT_TipoFactura", js: "U_HBT_TipoFactura", typ: null },
        { json: "U_HBT_MedPag", js: "U_HBT_MedPag", typ: null },
        { json: "U_HBT_CondEntre", js: "U_HBT_CondEntre", typ: null },
        { json: "U_HBT_CodDescuentos", js: "U_HBT_CodDescuentos", typ: null },
        { json: "U_HBT_RazonDescuento", js: "U_HBT_RazonDescuento", typ: null },
        { json: "U_HBT_DocNoTributar", js: "U_HBT_DocNoTributar", typ: "" },
        { json: "U_HBT_Mand_Contrato", js: "U_HBT_Mand_Contrato", typ: null },
        { json: "U_HBT_Tipo_Operacion", js: "U_HBT_Tipo_Operacion", typ: "" },
        { json: "U_HBT_IdFacturaDif", js: "U_HBT_IdFacturaDif", typ: null },
        { json: "U_HBT_CuentaIngDif", js: "U_HBT_CuentaIngDif", typ: null },
        { json: "U_HBT_SaldoAplicado", js: "U_HBT_SaldoAplicado", typ: "" },
        { json: "U_SCGM_Status", js: "U_SCGM_Status", typ: "" },
        { json: "U_HBT_EstadoCE", js: "U_HBT_EstadoCE", typ: null },
        { json: "U_HBT_DetalleEstado", js: "U_HBT_DetalleEstado", typ: null },
        { json: "U_HBT_FechaEnvCE", js: "U_HBT_FechaEnvCE", typ: null },
        { json: "U_HBT_FechaAceCE", js: "U_HBT_FechaAceCE", typ: null },
        { json: "U_HBT_GUID", js: "U_HBT_GUID", typ: null },
        { json: "U_HBT_ClaveAcceso", js: "U_HBT_ClaveAcceso", typ: null },
        { json: "U_HBT_NombreArcXMLCE", js: "U_HBT_NombreArcXMLCE", typ: null },
        { json: "U_HBT_VisorPublico", js: "U_HBT_VisorPublico", typ: null },
        { json: "U_HBT_IdEnProveedor", js: "U_HBT_IdEnProveedor", typ: null },
        { json: "U_HBT_Autorizacion", js: "U_HBT_Autorizacion", typ: null },
        { json: "U_HBT_DocNumEnviado", js: "U_HBT_DocNumEnviado", typ: null },
        { json: "U_HBT_MailSocio", js: "U_HBT_MailSocio", typ: null },
        { json: "U_ReceiptDocumentRef", js: "U_ReceiptDocumentRef", typ: null },
        { json: "U_HBT_ResCodigo", js: "U_HBT_ResCodigo", typ: null },
        { json: "U_HBT_ResDesLarga", js: "U_HBT_ResDesLarga", typ: null },
        { json: "U_HBT_IdFactura", js: "U_HBT_IdFactura", typ: null },
        { json: "U_HBT_ConceptoNC", js: "U_HBT_ConceptoNC", typ: null },
        { json: "U_HBT_ConceptoND", js: "U_HBT_ConceptoND", typ: null },
        { json: "U_HBT_EstadoDIAN", js: "U_HBT_EstadoDIAN", typ: 0 },
        { json: "U_HBT_EstadoEntrega", js: "U_HBT_EstadoEntrega", typ: 0 },
        { json: "U_HBT_ReceiptLineRef", js: "U_HBT_ReceiptLineRef", typ: null },
        { json: "U_HBT_ReceiptDocUBL", js: "U_HBT_ReceiptDocUBL", typ: null },
        { json: "U_HBT_FE_Ref", js: "U_HBT_FE_Ref", typ: null },
        { json: "U_HBT_Serie_Ref", js: "U_HBT_Serie_Ref", typ: null },
        { json: "U_HBT_FecOrdenCompra", js: "U_HBT_FecOrdenCompra", typ: null },
        { json: "U_HBT_SinStock", js: "U_HBT_SinStock", typ: "" },
        { json: "U_HBT_Estado", js: "U_HBT_Estado", typ: null },
        { json: "U_HBT_Contrato", js: "U_HBT_Contrato", typ: null },
        { json: "U_HBT_IdMasivo", js: "U_HBT_IdMasivo", typ: null },
        { json: "U_HBT_FecEntEfec", js: "U_HBT_FecEntEfec", typ: null },
        { json: "U_HBT_IdPreNum", js: "U_HBT_IdPreNum", typ: null },
        { json: "U_HBT_IdTranComfiar", js: "U_HBT_IdTranComfiar", typ: null },
        { json: "U_IFRS_DCOBRO", js: "U_IFRS_DCOBRO", typ: "" },
        { json: "U_NF_ALDESFINAL", js: "U_NF_ALDESFINAL", typ: null },
        { json: "U_NF_AutCargue", js: "U_NF_AutCargue", typ: null },
        { json: "U_NF_PlanillaTrans", js: "U_NF_PlanillaTrans", typ: null },
        { json: "U_NF_Transportadora", js: "U_NF_Transportadora", typ: null },
        { json: "U_NF_Placa", js: "U_NF_Placa", typ: null },
        { json: "U_NF_IdConductor", js: "U_NF_IdConductor", typ: null },
        { json: "U_NF_Tara", js: "U_NF_Tara", typ: 0 },
        { json: "U_NF_PesoCarga", js: "U_NF_PesoCarga", typ: 0 },
        { json: "U_NT_verincoterm", js: "U_NT_verincoterm", typ: null },
        { json: "U_NT_Incoterms", js: "U_NT_Incoterms", typ: null },
        { json: "U_U_NT_verincoterm", js: "U_U_NT_verincoterm", typ: null },
        { json: "U_NF_MOTNOTA", js: "U_NF_MOTNOTA", typ: null },
        { json: "U_NF_NOMCONDUC", js: "U_NF_NOMCONDUC", typ: null },
        { json: "U_NF_DESTINO", js: "U_NF_DESTINO", typ: "" },
        { json: "U_NF_CONDTRANS", js: "U_NF_CONDTRANS", typ: null },
        { json: "U_NF_PEDCONTIG", js: "U_NF_PEDCONTIG", typ: null },
        { json: "U_NF_REMICONTIG", js: "U_NF_REMICONTIG", typ: null },
        { json: "U_NF_DEPEN_SOLPED", js: "U_NF_DEPEN_SOLPED", typ: null },
        { json: "U_HBT_CausaCorrecion", js: "U_HBT_CausaCorrecion", typ: null },
        { json: "U_NTF_CONS_PAGO", js: "U_NTF_CONS_PAGO", typ: null },
        { json: "U_NTF_FECH_CONS_PAGO", js: "U_NTF_FECH_CONS_PAGO", typ: null },
        { json: "U_RECFACT", js: "U_RECFACT", typ: null },
        { json: "U_NF_FACTURAFPP", js: "U_NF_FACTURAFPP", typ: null },
        { json: "Document_ApprovalRequests", js: "Document_ApprovalRequests", typ: a("any") },
        { json: "DocumentLines", js: "DocumentLines", typ: a(r("DocumentLine")) },
        { json: "ElectronicProtocols", js: "ElectronicProtocols", typ: a("any") },
        { json: "DocumentSpecialLines", js: "DocumentSpecialLines", typ: a("any") },
        { json: "TaxExtension", js: "TaxExtension", typ: r("TaxExtension") },
        { json: "AddressExtension", js: "AddressExtension", typ: r("AddressExtension") },
        { json: "DocumentReferences", js: "DocumentReferences", typ: a("any") },
    ], false),
    "AddressExtension": o([
        { json: "ShipToStreet", js: "ShipToStreet", typ: "" },
        { json: "ShipToStreetNo", js: "ShipToStreetNo", typ: "" },
        { json: "ShipToBlock", js: "ShipToBlock", typ: null },
        { json: "ShipToBuilding", js: "ShipToBuilding", typ: null },
        { json: "ShipToCity", js: "ShipToCity", typ: "" },
        { json: "ShipToZipCode", js: "ShipToZipCode", typ: "" },
        { json: "ShipToCounty", js: "ShipToCounty", typ: null },
        { json: "ShipToState", js: "ShipToState", typ: "" },
        { json: "ShipToCountry", js: "ShipToCountry", typ: "" },
        { json: "ShipToAddressType", js: "ShipToAddressType", typ: null },
        { json: "BillToStreet", js: "BillToStreet", typ: null },
        { json: "BillToStreetNo", js: "BillToStreetNo", typ: null },
        { json: "BillToBlock", js: "BillToBlock", typ: null },
        { json: "BillToBuilding", js: "BillToBuilding", typ: null },
        { json: "BillToCity", js: "BillToCity", typ: null },
        { json: "BillToZipCode", js: "BillToZipCode", typ: null },
        { json: "BillToCounty", js: "BillToCounty", typ: null },
        { json: "BillToState", js: "BillToState", typ: null },
        { json: "BillToCountry", js: "BillToCountry", typ: null },
        { json: "BillToAddressType", js: "BillToAddressType", typ: null },
        { json: "ShipToGlobalLocationNumber", js: "ShipToGlobalLocationNumber", typ: "" },
        { json: "BillToGlobalLocationNumber", js: "BillToGlobalLocationNumber", typ: null },
        { json: "ShipToAddress2", js: "ShipToAddress2", typ: null },
        { json: "ShipToAddress3", js: "ShipToAddress3", typ: null },
        { json: "BillToAddress2", js: "BillToAddress2", typ: null },
        { json: "BillToAddress3", js: "BillToAddress3", typ: null },
        { json: "PlaceOfSupply", js: "PlaceOfSupply", typ: null },
        { json: "PurchasePlaceOfSupply", js: "PurchasePlaceOfSupply", typ: null },
        { json: "DocEntry", js: "DocEntry", typ: 0 },
        { json: "GoodsIssuePlaceBP", js: "GoodsIssuePlaceBP", typ: null },
        { json: "GoodsIssuePlaceCNPJ", js: "GoodsIssuePlaceCNPJ", typ: null },
        { json: "GoodsIssuePlaceCPF", js: "GoodsIssuePlaceCPF", typ: null },
        { json: "GoodsIssuePlaceStreet", js: "GoodsIssuePlaceStreet", typ: null },
        { json: "GoodsIssuePlaceStreetNo", js: "GoodsIssuePlaceStreetNo", typ: null },
        { json: "GoodsIssuePlaceBuilding", js: "GoodsIssuePlaceBuilding", typ: null },
        { json: "GoodsIssuePlaceZip", js: "GoodsIssuePlaceZip", typ: null },
        { json: "GoodsIssuePlaceBlock", js: "GoodsIssuePlaceBlock", typ: null },
        { json: "GoodsIssuePlaceCity", js: "GoodsIssuePlaceCity", typ: null },
        { json: "GoodsIssuePlaceCounty", js: "GoodsIssuePlaceCounty", typ: null },
        { json: "GoodsIssuePlaceState", js: "GoodsIssuePlaceState", typ: null },
        { json: "GoodsIssuePlaceCountry", js: "GoodsIssuePlaceCountry", typ: null },
        { json: "GoodsIssuePlacePhone", js: "GoodsIssuePlacePhone", typ: null },
        { json: "GoodsIssuePlaceEMail", js: "GoodsIssuePlaceEMail", typ: null },
        { json: "GoodsIssuePlaceDepartureDate", js: "GoodsIssuePlaceDepartureDate", typ: null },
        { json: "DeliveryPlaceBP", js: "DeliveryPlaceBP", typ: null },
        { json: "DeliveryPlaceCNPJ", js: "DeliveryPlaceCNPJ", typ: null },
        { json: "DeliveryPlaceCPF", js: "DeliveryPlaceCPF", typ: null },
        { json: "DeliveryPlaceStreet", js: "DeliveryPlaceStreet", typ: null },
        { json: "DeliveryPlaceStreetNo", js: "DeliveryPlaceStreetNo", typ: null },
        { json: "DeliveryPlaceBuilding", js: "DeliveryPlaceBuilding", typ: null },
        { json: "DeliveryPlaceZip", js: "DeliveryPlaceZip", typ: null },
        { json: "DeliveryPlaceBlock", js: "DeliveryPlaceBlock", typ: null },
        { json: "DeliveryPlaceCity", js: "DeliveryPlaceCity", typ: null },
        { json: "DeliveryPlaceCounty", js: "DeliveryPlaceCounty", typ: null },
        { json: "DeliveryPlaceState", js: "DeliveryPlaceState", typ: null },
        { json: "DeliveryPlaceCountry", js: "DeliveryPlaceCountry", typ: null },
        { json: "DeliveryPlacePhone", js: "DeliveryPlacePhone", typ: null },
        { json: "DeliveryPlaceEMail", js: "DeliveryPlaceEMail", typ: null },
        { json: "DeliveryPlaceDepartureDate", js: "DeliveryPlaceDepartureDate", typ: null },
        { json: "U_HBT_MunMedS", js: "U_HBT_MunMedS", typ: null },
        { json: "U_HBT_MunMedB", js: "U_HBT_MunMedB", typ: null },
        { json: "U_HBT_DirMMS", js: "U_HBT_DirMMS", typ: "" },
        { json: "U_HBT_DirMMB", js: "U_HBT_DirMMB", typ: "" },
    ], false),
    "DocumentLine": o([
        { json: "LineNum", js: "LineNum", typ: 0 },
        { json: "ItemCode", js: "ItemCode", typ: null },
        { json: "ItemDescription", js: "ItemDescription", typ: "" },
        { json: "Quantity", js: "Quantity", typ: 0 },
        { json: "ShipDate", js: "ShipDate", typ: null },
        { json: "Price", js: "Price", typ: 0 },
        { json: "PriceAfterVAT", js: "PriceAfterVAT", typ: 0 },
        { json: "Currency", js: "Currency", typ: "" },
        { json: "Rate", js: "Rate", typ: 0 },
        { json: "DiscountPercent", js: "DiscountPercent", typ: 0 },
        { json: "VendorNum", js: "VendorNum", typ: null },
        { json: "SerialNum", js: "SerialNum", typ: null },
        { json: "WarehouseCode", js: "WarehouseCode", typ: null },
        { json: "SalesPersonCode", js: "SalesPersonCode", typ: 0 },
        { json: "CommisionPercent", js: "CommisionPercent", typ: 0 },
        { json: "TreeType", js: "TreeType", typ: "" },
        { json: "AccountCode", js: "AccountCode", typ: "" },
        { json: "UseBaseUnits", js: "UseBaseUnits", typ: "" },
        { json: "SupplierCatNum", js: "SupplierCatNum", typ: null },
        { json: "CostingCode", js: "CostingCode", typ: "" },
        { json: "ProjectCode", js: "ProjectCode", typ: "" },
        { json: "BarCode", js: "BarCode", typ: null },
        { json: "VatGroup", js: "VatGroup", typ: "" },
        { json: "Height1", js: "Height1", typ: 0 },
        { json: "Hight1Unit", js: "Hight1Unit", typ: null },
        { json: "Height2", js: "Height2", typ: 0 },
        { json: "Height2Unit", js: "Height2Unit", typ: null },
        { json: "Lengh1", js: "Lengh1", typ: 0 },
        { json: "Lengh1Unit", js: "Lengh1Unit", typ: null },
        { json: "Lengh2", js: "Lengh2", typ: 0 },
        { json: "Lengh2Unit", js: "Lengh2Unit", typ: null },
        { json: "Weight1", js: "Weight1", typ: 0 },
        { json: "Weight1Unit", js: "Weight1Unit", typ: null },
        { json: "Weight2", js: "Weight2", typ: 0 },
        { json: "Weight2Unit", js: "Weight2Unit", typ: null },
        { json: "Factor1", js: "Factor1", typ: 0 },
        { json: "Factor2", js: "Factor2", typ: 0 },
        { json: "Factor3", js: "Factor3", typ: 0 },
        { json: "Factor4", js: "Factor4", typ: 0 },
        { json: "BaseType", js: "BaseType", typ: 0 },
        { json: "BaseEntry", js: "BaseEntry", typ: null },
        { json: "BaseLine", js: "BaseLine", typ: null },
        { json: "Volume", js: "Volume", typ: 0 },
        { json: "VolumeUnit", js: "VolumeUnit", typ: null },
        { json: "Width1", js: "Width1", typ: 0 },
        { json: "Width1Unit", js: "Width1Unit", typ: null },
        { json: "Width2", js: "Width2", typ: 0 },
        { json: "Width2Unit", js: "Width2Unit", typ: null },
        { json: "Address", js: "Address", typ: "" },
        { json: "TaxCode", js: "TaxCode", typ: "" },
        { json: "TaxType", js: "TaxType", typ: "" },
        { json: "TaxLiable", js: "TaxLiable", typ: "" },
        { json: "PickStatus", js: "PickStatus", typ: "" },
        { json: "PickQuantity", js: "PickQuantity", typ: 0 },
        { json: "PickListIdNumber", js: "PickListIdNumber", typ: null },
        { json: "OriginalItem", js: "OriginalItem", typ: null },
        { json: "BackOrder", js: "BackOrder", typ: null },
        { json: "FreeText", js: "FreeText", typ: null },
        { json: "ShippingMethod", js: "ShippingMethod", typ: 0 },
        { json: "POTargetNum", js: "POTargetNum", typ: null },
        { json: "POTargetEntry", js: "POTargetEntry", typ: null },
        { json: "POTargetRowNum", js: "POTargetRowNum", typ: null },
        { json: "CorrectionInvoiceItem", js: "CorrectionInvoiceItem", typ: "" },
        { json: "CorrInvAmountToStock", js: "CorrInvAmountToStock", typ: 0 },
        { json: "CorrInvAmountToDiffAcct", js: "CorrInvAmountToDiffAcct", typ: 0 },
        { json: "AppliedTax", js: "AppliedTax", typ: 0 },
        { json: "AppliedTaxFC", js: "AppliedTaxFC", typ: 0 },
        { json: "AppliedTaxSC", js: "AppliedTaxSC", typ: 0 },
        { json: "WTLiable", js: "WTLiable", typ: "" },
        { json: "DeferredTax", js: "DeferredTax", typ: "" },
        { json: "EqualizationTaxPercent", js: "EqualizationTaxPercent", typ: 0 },
        { json: "TotalEqualizationTax", js: "TotalEqualizationTax", typ: 0 },
        { json: "TotalEqualizationTaxFC", js: "TotalEqualizationTaxFC", typ: 0 },
        { json: "TotalEqualizationTaxSC", js: "TotalEqualizationTaxSC", typ: 0 },
        { json: "NetTaxAmount", js: "NetTaxAmount", typ: 0 },
        { json: "NetTaxAmountFC", js: "NetTaxAmountFC", typ: 0 },
        { json: "NetTaxAmountSC", js: "NetTaxAmountSC", typ: 0 },
        { json: "MeasureUnit", js: "MeasureUnit", typ: null },
        { json: "UnitsOfMeasurment", js: "UnitsOfMeasurment", typ: 0 },
        { json: "LineTotal", js: "LineTotal", typ: 0 },
        { json: "TaxPercentagePerRow", js: "TaxPercentagePerRow", typ: 0 },
        { json: "TaxTotal", js: "TaxTotal", typ: 0 },
        { json: "ConsumerSalesForecast", js: "ConsumerSalesForecast", typ: null },
        { json: "ExciseAmount", js: "ExciseAmount", typ: 0 },
        { json: "TaxPerUnit", js: "TaxPerUnit", typ: 0 },
        { json: "TotalInclTax", js: "TotalInclTax", typ: 0 },
        { json: "CountryOrg", js: "CountryOrg", typ: null },
        { json: "SWW", js: "SWW", typ: null },
        { json: "TransactionType", js: "TransactionType", typ: null },
        { json: "DistributeExpense", js: "DistributeExpense", typ: "" },
        { json: "RowTotalFC", js: "RowTotalFC", typ: 0 },
        { json: "RowTotalSC", js: "RowTotalSC", typ: 3.14 },
        { json: "LastBuyInmPrice", js: "LastBuyInmPrice", typ: 0 },
        { json: "LastBuyDistributeSumFc", js: "LastBuyDistributeSumFc", typ: 0 },
        { json: "LastBuyDistributeSumSc", js: "LastBuyDistributeSumSc", typ: 0 },
        { json: "LastBuyDistributeSum", js: "LastBuyDistributeSum", typ: 0 },
        { json: "StockDistributesumForeign", js: "StockDistributesumForeign", typ: 0 },
        { json: "StockDistributesumSystem", js: "StockDistributesumSystem", typ: 0 },
        { json: "StockDistributesum", js: "StockDistributesum", typ: 0 },
        { json: "StockInmPrice", js: "StockInmPrice", typ: 0 },
        { json: "PickStatusEx", js: "PickStatusEx", typ: "" },
        { json: "TaxBeforeDPM", js: "TaxBeforeDPM", typ: 0 },
        { json: "TaxBeforeDPMFC", js: "TaxBeforeDPMFC", typ: 0 },
        { json: "TaxBeforeDPMSC", js: "TaxBeforeDPMSC", typ: 0 },
        { json: "CFOPCode", js: "CFOPCode", typ: null },
        { json: "CSTCode", js: "CSTCode", typ: null },
        { json: "Usage", js: "Usage", typ: null },
        { json: "TaxOnly", js: "TaxOnly", typ: "" },
        { json: "VisualOrder", js: "VisualOrder", typ: 0 },
        { json: "BaseOpenQuantity", js: "BaseOpenQuantity", typ: 0 },
        { json: "UnitPrice", js: "UnitPrice", typ: 0 },
        { json: "LineStatus", js: "LineStatus", typ: "" },
        { json: "PackageQuantity", js: "PackageQuantity", typ: 0 },
        { json: "Text", js: "Text", typ: null },
        { json: "LineType", js: "LineType", typ: "" },
        { json: "COGSCostingCode", js: "COGSCostingCode", typ: null },
        { json: "COGSAccountCode", js: "COGSAccountCode", typ: null },
        { json: "ChangeAssemlyBoMWarehouse", js: "ChangeAssemlyBoMWarehouse", typ: null },
        { json: "GrossBuyPrice", js: "GrossBuyPrice", typ: 0 },
        { json: "GrossBase", js: "GrossBase", typ: null },
        { json: "GrossProfitTotalBasePrice", js: "GrossProfitTotalBasePrice", typ: 0 },
        { json: "CostingCode2", js: "CostingCode2", typ: "" },
        { json: "CostingCode3", js: "CostingCode3", typ: "" },
        { json: "CostingCode4", js: "CostingCode4", typ: null },
        { json: "CostingCode5", js: "CostingCode5", typ: null },
        { json: "ItemDetails", js: "ItemDetails", typ: null },
        { json: "LocationCode", js: "LocationCode", typ: null },
        { json: "ActualDeliveryDate", js: "ActualDeliveryDate", typ: null },
        { json: "RemainingOpenQuantity", js: "RemainingOpenQuantity", typ: 0 },
        { json: "OpenAmount", js: "OpenAmount", typ: 0 },
        { json: "OpenAmountFC", js: "OpenAmountFC", typ: 0 },
        { json: "OpenAmountSC", js: "OpenAmountSC", typ: 0 },
        { json: "ExLineNo", js: "ExLineNo", typ: null },
        { json: "RequiredDate", js: "RequiredDate", typ: Date },
        { json: "RequiredQuantity", js: "RequiredQuantity", typ: 0 },
        { json: "COGSCostingCode2", js: "COGSCostingCode2", typ: null },
        { json: "COGSCostingCode3", js: "COGSCostingCode3", typ: null },
        { json: "COGSCostingCode4", js: "COGSCostingCode4", typ: null },
        { json: "COGSCostingCode5", js: "COGSCostingCode5", typ: null },
        { json: "CSTforIPI", js: "CSTforIPI", typ: null },
        { json: "CSTforPIS", js: "CSTforPIS", typ: null },
        { json: "CSTforCOFINS", js: "CSTforCOFINS", typ: null },
        { json: "CreditOriginCode", js: "CreditOriginCode", typ: null },
        { json: "WithoutInventoryMovement", js: "WithoutInventoryMovement", typ: "" },
        { json: "AgreementNo", js: "AgreementNo", typ: null },
        { json: "AgreementRowNumber", js: "AgreementRowNumber", typ: null },
        { json: "ActualBaseEntry", js: "ActualBaseEntry", typ: null },
        { json: "ActualBaseLine", js: "ActualBaseLine", typ: null },
        { json: "DocEntry", js: "DocEntry", typ: 0 },
        { json: "Surpluses", js: "Surpluses", typ: 0 },
        { json: "DefectAndBreakup", js: "DefectAndBreakup", typ: 0 },
        { json: "Shortages", js: "Shortages", typ: 0 },
        { json: "ConsiderQuantity", js: "ConsiderQuantity", typ: "" },
        { json: "PartialRetirement", js: "PartialRetirement", typ: "" },
        { json: "RetirementQuantity", js: "RetirementQuantity", typ: 0 },
        { json: "RetirementAPC", js: "RetirementAPC", typ: 0 },
        { json: "ThirdParty", js: "ThirdParty", typ: "" },
        { json: "PoNum", js: "PoNum", typ: null },
        { json: "PoItmNum", js: "PoItmNum", typ: null },
        { json: "ExpenseType", js: "ExpenseType", typ: null },
        { json: "ReceiptNumber", js: "ReceiptNumber", typ: null },
        { json: "ExpenseOperationType", js: "ExpenseOperationType", typ: null },
        { json: "FederalTaxID", js: "FederalTaxID", typ: null },
        { json: "GrossProfit", js: "GrossProfit", typ: 0 },
        { json: "GrossProfitFC", js: "GrossProfitFC", typ: 0 },
        { json: "GrossProfitSC", js: "GrossProfitSC", typ: 0 },
        { json: "PriceSource", js: "PriceSource", typ: "" },
        { json: "LineVendor", js: "LineVendor", typ: "" },
        { json: "StgSeqNum", js: "StgSeqNum", typ: null },
        { json: "StgEntry", js: "StgEntry", typ: null },
        { json: "StgDesc", js: "StgDesc", typ: null },
        { json: "UoMEntry", js: "UoMEntry", typ: 0 },
        { json: "UoMCode", js: "UoMCode", typ: null },
        { json: "InventoryQuantity", js: "InventoryQuantity", typ: 0 },
        { json: "RemainingOpenInventoryQuantity", js: "RemainingOpenInventoryQuantity", typ: 0 },
        { json: "ParentLineNum", js: "ParentLineNum", typ: null },
        { json: "Incoterms", js: "Incoterms", typ: 0 },
        { json: "TransportMode", js: "TransportMode", typ: 0 },
        { json: "NatureOfTransaction", js: "NatureOfTransaction", typ: null },
        { json: "DestinationCountryForImport", js: "DestinationCountryForImport", typ: null },
        { json: "DestinationRegionForImport", js: "DestinationRegionForImport", typ: null },
        { json: "OriginCountryForExport", js: "OriginCountryForExport", typ: null },
        { json: "OriginRegionForExport", js: "OriginRegionForExport", typ: null },
        { json: "ItemType", js: "ItemType", typ: "" },
        { json: "ChangeInventoryQuantityIndependently", js: "ChangeInventoryQuantityIndependently", typ: "" },
        { json: "FreeOfChargeBP", js: "FreeOfChargeBP", typ: "" },
        { json: "SACEntry", js: "SACEntry", typ: null },
        { json: "HSNEntry", js: "HSNEntry", typ: null },
        { json: "GrossPrice", js: "GrossPrice", typ: 0 },
        { json: "GrossTotal", js: "GrossTotal", typ: 0 },
        { json: "GrossTotalFC", js: "GrossTotalFC", typ: 0 },
        { json: "GrossTotalSC", js: "GrossTotalSC", typ: 3.14 },
        { json: "NCMCode", js: "NCMCode", typ: 0 },
        { json: "NVECode", js: "NVECode", typ: null },
        { json: "IndEscala", js: "IndEscala", typ: "" },
        { json: "CtrSealQty", js: "CtrSealQty", typ: 0 },
        { json: "CNJPMan", js: "CNJPMan", typ: null },
        { json: "CESTCode", js: "CESTCode", typ: null },
        { json: "UFFiscalBenefitCode", js: "UFFiscalBenefitCode", typ: null },
        { json: "ReverseCharge", js: "ReverseCharge", typ: "" },
        { json: "ShipFromCode", js: "ShipFromCode", typ: null },
        { json: "ShipFromDescription", js: "ShipFromDescription", typ: null },
        { json: "StandardItemIdentification", js: "StandardItemIdentification", typ: null },
        { json: "CommodityClassification", js: "CommodityClassification", typ: null },
        { json: "UnencumberedReason", js: "UnencumberedReason", typ: null },
        { json: "CUSplit", js: "CUSplit", typ: "" },
        { json: "U_HBT_CONC_ENTINV", js: "U_HBT_CONC_ENTINV", typ: null },
        { json: "U_HBT_CONC_SALINV", js: "U_HBT_CONC_SALINV", typ: null },
        { json: "U_HBT_ConDif", js: "U_HBT_ConDif", typ: null },
        { json: "U_HBT_DocEntryCap", js: "U_HBT_DocEntryCap", typ: null },
        { json: "U_HBT_Mand_Contrato", js: "U_HBT_Mand_Contrato", typ: null },
        { json: "U_HBT_Mand_FCont", js: "U_HBT_Mand_FCont", typ: null },
        { json: "U_HBT_Mand_1", js: "U_HBT_Mand_1", typ: null },
        { json: "U_HBT_Mand_2", js: "U_HBT_Mand_2", typ: null },
        { json: "U_HBT_MatMer_1", js: "U_HBT_MatMer_1", typ: null },
        { json: "U_HBT_MatMer_2", js: "U_HBT_MatMer_2", typ: null },
        { json: "U_HBT_Mand_PNRL", js: "U_HBT_Mand_PNRL", typ: null },
        { json: "U_HBT_Mand_SNRL", js: "U_HBT_Mand_SNRL", typ: null },
        { json: "U_HBT_Mand_ARL", js: "U_HBT_Mand_ARL", typ: null },
        { json: "U_HBT_Imprimir", js: "U_HBT_Imprimir", typ: "" },
        { json: "U_HBT_Descripcion", js: "U_HBT_Descripcion", typ: null },
        { json: "U_HBT_Valor", js: "U_HBT_Valor", typ: 0 },
        { json: "U_HBT_ConceptoDife", js: "U_HBT_ConceptoDife", typ: null },
        { json: "U_HBT_TipoPrecioRef", js: "U_HBT_TipoPrecioRef", typ: "" },
        { json: "U_HBT_BaseInstalada", js: "U_HBT_BaseInstalada", typ: null },
        { json: "U_HBT_VigDesde", js: "U_HBT_VigDesde", typ: null },
        { json: "U_HBT_VigHasta", js: "U_HBT_VigHasta", typ: null },
        { json: "U_HBT_CuotasDif", js: "U_HBT_CuotasDif", typ: 0 },
        { json: "U_HBT_DigVerMan", js: "U_HBT_DigVerMan", typ: null },
        { json: "U_HBT_TipDocMan", js: "U_HBT_TipDocMan", typ: null },
        { json: "U_HBT_RazonDescuento", js: "U_HBT_RazonDescuento", typ: null },
        { json: "U_HBT_Cantidad", js: "U_HBT_Cantidad", typ: 0 },
        { json: "U_HBT_UndMedida", js: "U_HBT_UndMedida", typ: null },
        { json: "U_HBT_TipoIngreso", js: "U_HBT_TipoIngreso", typ: null },
        { json: "U_HBT_CodArticulo", js: "U_HBT_CodArticulo", typ: null },
        { json: "U_NF_EMISION", js: "U_NF_EMISION", typ: null },
        { json: "U_NF_ACUERDO", js: "U_NF_ACUERDO", typ: null },
        { json: "LineTaxJurisdictions", js: "LineTaxJurisdictions", typ: a("any") },
        { json: "DocumentLineAdditionalExpenses", js: "DocumentLineAdditionalExpenses", typ: a("any") },
    ], false),
    "TaxExtension": o([
        { json: "TaxId0", js: "TaxId0", typ: null },
        { json: "TaxId1", js: "TaxId1", typ: null },
        { json: "TaxId2", js: "TaxId2", typ: null },
        { json: "TaxId3", js: "TaxId3", typ: null },
        { json: "TaxId4", js: "TaxId4", typ: null },
        { json: "TaxId5", js: "TaxId5", typ: null },
        { json: "TaxId6", js: "TaxId6", typ: null },
        { json: "TaxId7", js: "TaxId7", typ: null },
        { json: "TaxId8", js: "TaxId8", typ: null },
        { json: "TaxId9", js: "TaxId9", typ: null },
        { json: "State", js: "State", typ: null },
        { json: "County", js: "County", typ: null },
        { json: "Incoterms", js: "Incoterms", typ: null },
        { json: "Vehicle", js: "Vehicle", typ: null },
        { json: "VehicleState", js: "VehicleState", typ: null },
        { json: "NFRef", js: "NFRef", typ: null },
        { json: "Carrier", js: "Carrier", typ: null },
        { json: "PackQuantity", js: "PackQuantity", typ: null },
        { json: "PackDescription", js: "PackDescription", typ: null },
        { json: "Brand", js: "Brand", typ: null },
        { json: "ShipUnitNo", js: "ShipUnitNo", typ: null },
        { json: "NetWeight", js: "NetWeight", typ: 0 },
        { json: "GrossWeight", js: "GrossWeight", typ: 0 },
        { json: "StreetS", js: "StreetS", typ: "" },
        { json: "BlockS", js: "BlockS", typ: null },
        { json: "BuildingS", js: "BuildingS", typ: null },
        { json: "CityS", js: "CityS", typ: "" },
        { json: "ZipCodeS", js: "ZipCodeS", typ: "" },
        { json: "CountyS", js: "CountyS", typ: null },
        { json: "StateS", js: "StateS", typ: "" },
        { json: "CountryS", js: "CountryS", typ: "" },
        { json: "StreetB", js: "StreetB", typ: null },
        { json: "BlockB", js: "BlockB", typ: null },
        { json: "BuildingB", js: "BuildingB", typ: null },
        { json: "CityB", js: "CityB", typ: null },
        { json: "ZipCodeB", js: "ZipCodeB", typ: null },
        { json: "CountyB", js: "CountyB", typ: null },
        { json: "StateB", js: "StateB", typ: null },
        { json: "CountryB", js: "CountryB", typ: null },
        { json: "ImportOrExport", js: "ImportOrExport", typ: null },
        { json: "MainUsage", js: "MainUsage", typ: null },
        { json: "GlobalLocationNumberS", js: "GlobalLocationNumberS", typ: "" },
        { json: "GlobalLocationNumberB", js: "GlobalLocationNumberB", typ: null },
        { json: "TaxId12", js: "TaxId12", typ: null },
        { json: "TaxId13", js: "TaxId13", typ: null },
        { json: "BillOfEntryNo", js: "BillOfEntryNo", typ: null },
        { json: "BillOfEntryDate", js: "BillOfEntryDate", typ: null },
        { json: "OriginalBillOfEntryNo", js: "OriginalBillOfEntryNo", typ: null },
        { json: "OriginalBillOfEntryDate", js: "OriginalBillOfEntryDate", typ: null },
        { json: "ImportOrExportType", js: "ImportOrExportType", typ: "" },
        { json: "PortCode", js: "PortCode", typ: null },
        { json: "DocEntry", js: "DocEntry", typ: 0 },
        { json: "BoEValue", js: "BoEValue", typ: 0 },
        { json: "ClaimRefund", js: "ClaimRefund", typ: null },
        { json: "DifferentialOfTaxRate", js: "DifferentialOfTaxRate", typ: null },
        { json: "IsIGSTAccount", js: "IsIGSTAccount", typ: "" },
    ], false),
};
