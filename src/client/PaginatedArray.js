import _ from 'lodash';
import {observable, action, computed} from 'mobx';

class PaginatedArray {
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
    if (this.currentPage == this.maxPage) {
      return Promise.reject();
    }

    this.currentPage = this.currentPage + 1;
    return Promise.resolve(this.currentPage);
  }

  @action prevPage() {
    if (this.currentPage == 1) {
      return Promise.reject();
    }

    this.currentPage = this.currentPage - 1;
    return Promise.resolve(this.currentPage);
  }

  @action setPage(page) {
    if (page <= this.maxPage && page >= 1) {
      this.currentPage = parseInt(page, 10);
    }
  }

  @computed get currentPageData() {
    return this.data[this.currentPage-1];
  }
}

export default PaginatedArray;
