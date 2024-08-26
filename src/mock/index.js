import Mock from 'mockjs'

const ocr = {
  type: 'reviewOne',
  data: {
    companyName: '广西有趣科技有限公司',
    socialCode: '9145012345678910',
    residence: '广西壮族自治区南宁市青秀区古城路111号',
    contactNumber: '0771-5871234',
    postalCode: '530000',
    nameOfLegalRepresentative: '高启强',
    typeOfCompany: '乙有限责任公司\n口股份有限公司\n口外资有限责任公司\n口外资股份有限公司',
    registeredCapital: '5500\n万元\n(币种：\n人民币\n□其他',
    totalInvestment: '200\n万元(币种：\n人民币\n折美元：\n万元',
    modeOfEstablishment: 'Z发起设立\n□夢集设立',
    applyForALicense: '乙中领纸质执照其中：副本个(电子执照系统自动生成，纸质执照自行勾选)',
    businessTerm: 'Z长期\n年',
    businessScope:
      '(涉及“多证合一”事项办理的，申请人须根据市场主体自身情况填写《“多证合\n政府部门共享信息项》相关内容。)'
  }
}

const formOne = {
  companyName: { checkItem: null, right: true },
  contactNumber: { checkItem: null, right: true },
  nameOfLegalRepresentative: { checkItem: null, right: true },
  postalCode: { checkItem: null, right: true },
  residence: { checkItem: null, right: true },
  socialCode: {
    checkItem: 'Social code must be 18 characters long and consist of digits and uppercase letters',
    right: false
  }
}

Mock.mock('/api/upload', 'post', {
  code: 200,
  message: 'OCR success',
  data: 'http://localhost:xxxx/picture/xxx-xxx-xxxx'
})

Mock.mock('/api/ocr', 'post', {
  code: 200,
  message: 'OCR success',
  data: JSON.stringify(ocr)
})

Mock.mock('/api/reviewOne', 'post', {
  code: 200,
  message: 'OCR success',
  data: JSON.stringify(formOne)
})

Mock.setup({
  timeout: '500-1500'
})
