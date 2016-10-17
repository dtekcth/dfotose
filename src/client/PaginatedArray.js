import _ from 'lodash';
import {observable, action, computed} from 'mobx';

export default class PaginatedArray {
  @observable data = [];

  pageSize = 28;
  @observable currentPage = 1;
  @observable maxPage = 1;

  constructor(arr, pageSize) {
    const chunkedArr = _.chunk(arr, pageSize);
    this.data = chunkedArr;
    this.pageSize = pageSize;
    this.maxPage = chunkedArr.length;
  }

  @action nextPage() {
    if (this.currentPage >= this.maxPage) {
      return Promise.reject();
    }

    this.currentPage = this.currentPage + 1;
    return Promise.resolve();
  }

  @action prevPage() {
    if (this.currentPage <= 1) {
      return Promise.reject();
    }

    this.currentPage = this.currentPage - 1;
    return Promise.resolve();
  }

  @computed currentPageData() {
    return this.data[this.currentPage];
  }
}

