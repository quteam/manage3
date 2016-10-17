# 后台管理系统 v3

预览 <http://html.quteam.com/manage-house/demo/>

## 说明

### 公用模块

#### details-info [指令]

```
<div details-info="../data/project-details.data" details-params='{id:{{pageInfo.curItem.id||0}}}'>
</div>
```

- <div details-info="Ajax 请求 URL" details-params="参数">
  </div>

- 内容块内用变量 details 获取 Ajax 请求回来的数据。如: `{{details.name}}` 。

无 details-params 时, details-info 可接受可变参数, 如: `details-info='../data/project-details.data?id={{id}}'`

#### form-validator [指令]

表单验证 和 提交

```
<form name="myForm" action="../data/form.data" form-validator novalidate postBlock>
</form>
```

- 验证并提交到 action 对应的地址;
- 表单在弹窗中, 加 auto-close-dialog, 表单提交成功后自动关闭弹窗;
- 加 novalidate 禁用 Html5 原生的验证;
- postBlock, 以 json 数据块的形式提交, 而非健值对。

#### table-list [指令]

通用列表

```
<table-list list-data="../data/customer-list.data" list-params="listParams">
    <div class="mg-m">
        <div class="fr">
            <pagination2 status="status"></pagination2>
        </div>
    </div>
    <table class="table-list">
        <thead>
        <tr>
            <th>状态</th>
            <th>姓名</th>
            <th>电话</th>
            <th>性别</th>
            <th>是否指定</th>
            <th>分配 - 截止</th>
            <th>任务预期</th>
            <th>到访意愿</th>
            <th>Call成次数</th>
            <th>Call客次数</th>
            <th>客户来源</th>
            <th>职业顾问</th>
            <th>销售小组</th>
            <th>销售经理</th>
            <th>有无档案</th>
            <th>详情</th>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="tr in tbodyList">
            <td>{{tr.status}}</td>
            <td>{{tr.name}}</td>
            <td>{{tr.tel}}</td>
            <td>{{tr.gender}}</td>
            <td>{{tr.isAppoint?"是":"否"}}</td>
            <td>{{tr.time1}} - {{tr.time2}}</td>
            <td>{{tr.isExpect?"已逾期":""}}</td>
            <td>{{tr.inclination}}</td>
            <td>{{tr.callSuccessNum}}</td>
            <td>{{tr.callNum}}</td>
            <td>{{tr.customerSource}}</td>
            <td>{{tr.advisor}}</td>
            <td>{{tr.saleGroup}}</td>
            <td>{{tr.saleAgent}}</td>
            <td><a href="{{tr.hasDoc}}" ng-if="tr.hasDoc">有档案</a></td>
            <td>
                <a href="#/customer-details.html" type="button" class="btn btn-s btn-white">查看</a>
            </td>
        </tr>
        </tbody>
    </table>
</table-list>
```

- list-data 数据来源 URL
- list-source 数据来源页面数据
- list-params 参数
- list-selected 返回选中的接口 Array

#### pagination, pagination2 [指令]

分页, 放在 table-list 中

```
<table-list list-data="../data/customer-list.data" list-params="listParams">
    <pagination status="status"></pagination>
</table-list>
```

- status 分页数据来源于 table-list

#### filter-conditions [指令]

筛选

```
<div filter-conditions="../data/customer-filter.data">
    <div class="dl" ng-if="filterConditions.list.length">
        <div class="dt">筛选条件</div>
        <div class="dd">
            <span class="tag2" ng-repeat="cdt in filterConditions.list">{{cdt.key}} <i class="del" ng-click="deleteCondition(cdt)"></i></span>
        </div>
    </div>
    <div class="dl" ng-if="!filterConditions.saleGroup">
        <div class="dt">销售小组</div>
        <div class="dd">
            <span ng-repeat="sale in conditionList.saleGroup" ng-click="selectCondition('saleGroup',sale)">{{sale.key}}</span>
        </div>
    </div>
    <div class="dl" ng-if="!filterConditions.building">
        <div class="dt">置业顾问</div>
        <div class="dd">
            <span ng-repeat="building in conditionList.building" ng-click="selectCondition('building',building)">{{building.key}}</span>
        </div>
    </div>
</div>
```

- filter-conditions 获取筛选条件;
- 返回的筛选条件数据放在 filterConditions 中。

#### tree-list [指令]

树状列表

```
<div class="tree-list" tree-list="../data/tree-discount.data" ng-model="itemData.item">
</div>
```

- tree-list 获取树结构;
- ng-model 中的变量为选中对象。

#### select-async [指令]

异步下拉

```
<select class="select" select-async="../data/selectlist.data" ng-model="formData.select1">
</select>
```

- select-async 下拉数据来源;
- ng-model 选中值。

#### relative-select [指令]

级联下拉

```
<select relative-select relative-initload relative-to="#relativeSelect3" class="select" ng-model="formData.select2" name="select2">
    <option value="">请选择</option>
    <option value="0">Option 1</option>
    <option value="1">Option 2</option>
    <option value="2">Option 3</option>
    <option value="3">Option 4</option>
</select>
<select relative-select="/302" relative-to="#relativeSelect4" class="select" ng-model="formData.select3" id="relativeSelect3" name="select3" select-first>
    <option value="">请选择</option>
</select>
<select relative-select="../data/selectlist.data" class="select" ng-model="formData.select4" id="relativeSelect4" name="select4">
    <option value="">请选择</option>
</select>
```

- 每个 relative-select 对应一个下拉数据;
- 第一个下拉可以用 relative-initload 初始还级连;
- 改变一个下拉值时将刷新 relative-to 对应的下拉, 并一次级连下去;
- select-first 选中第一个值。

#### chart [指令]

```
<div chart="../data/pie-chart.data?id=1" click-to-url="#/chart.html?id={{formData.chart.id}}" ng-model="formData.chart" style="height: 300px;"></div>
```

- chart 获取 eChart 配置文件;
- click-to-url 点击图表跳转链接。

#### angucomplete [指令]

自动补全

```
<span angucomplete placeholder="输入" title-field="text" url="../data/autocomplete.data" class="inline-block" ng-model="formData.text"></span>
```

- url 请求数据, `q:字符串`
- 更多参考 [angucomplete](https://github.com/darylrowland/angucomplete)

#### checkbox-group [指令]

多选

```
<label class="label">
    <input type="checkbox" value="选项1" name="checkbox" ng-model="checkbox1" checkbox-group="formData.checkbox"/> 选项1</label>
<label class="label">
    <input type="checkbox" value="选项2" name="checkbox" ng-model="checkbox2" checkbox-group="formData.checkbox"/> 选项2</label>
<label class="label">
    <input type="checkbox" value="选项3" name="checkbox" ng-model="checkbox3" checkbox-group="formData.checkbox"/> 选项3</label>
<label class="label">
    <input type="checkbox" value="选项4" name="checkbox" ng-model="checkbox4" checkbox-group="formData.checkbox"/> 选项4</label>
```

- checkbox-group 为选择的值

#### chosen [指令]

chosen 下拉

```
<select class="select select-w" data-placeholder="选择一个..." chosen multiple ng-model="formData.chosen2">
    <option value="1">United States</option>
    <option value="2">United Kingdom</option>
    <option value="3">Afghanistan</option>
    <option value="4">Aland Islands</option>
    <option value="5">Albania</option>
    <option value="6">Algeria</option>
    <option value="7">American Samoa</option>
    <option value="8">Andorra</option>
    <option value="9">Angola</option>
    <option value="10">Anguilla</option>
</select>
```

- multiple 多选
- ng-model 返回选择的 id, `["3","6","7"]`

#### uploader [指令]

上传

```
<div uploader="../data/upload.data" ng-model="formData.pics" data-files='[{"id":1,"url":"../ui/img/avatar.png"}]'></div>
```

- uploader 上传地址
- ng-model 上传后的值
- data-files 原有值
- upload-max 最大上传文件数
- upload-size 最大上传尺寸
- upload-type 上传文件类型, 默认为 image, 可配置 `image, *, 正则`

#### modal [指令]

弹窗

```
<div modal-right="920" modal-scope="this" modal-url="views/project-house-add.html?id={{::tr.id}}"></div>
<button type="button" modal-center="800" modal-scope="this" modal-url="views/project-fav-tag.html">收藏当前标签</button>
```

- modal-right 右侧弹窗, modal-center 中间弹窗, 值为 弹窗宽度
- modal-scope 传作用域, 基本上都是 this
- modal-url 弹窗访问的 URL

#### building-table [指令]

```
<div building-table list-source="details.rooms" list-config="details.config"></div>
```

- list-source 房源数据来源
- list-config 房源的配置信息

#### mainCtrl [控制器]

页面顶级控制器,用于记录导航等全局数据

#### oneCtrl [控制器]

一个空控制器, 用于隔离作用域, 随便怎么用

#### sideNav [控制器]

侧边菜单

#### pageCtrl [控制器]

管理右侧区域全局, 提供一些初始化处理, 比如: 跳页面时关闭全部窗口

#### myPlatformCtrl [控制器]

我的工作台主控

#### customerManageCtrl [控制器]

客户管理主控

#### projectManageCtrl [控制器]

项目管理页面主控

#### brokerManageCtrl [控制器]

经纪人管理主控

#### tagManageCtrl [控制器]

标签管理页面主控

#### orgManageCtrl [控制器]

组织构架管理主控

> 以上各主控主要用于导航和隔离

### 自定义模块
