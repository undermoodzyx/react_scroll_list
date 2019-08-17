function noop() {}
function debounce(fn = noop, delay) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

class ScrollList extends React.PureComponent {
  static defaultProps = {
    itemHeight: 44,
    couldScroll: true,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      lastScrollTop: null,
      // distance: 44,
      listPaddingTop: 0,
      listPaddingBottom: 0,
      canLoadmore: true,
      visibleList: [],
      displayCount: 0,
    }

    this.containerRef = React.createRef();
    this.listRef = React.createRef();

    this.visibleItemCount = 0; // 可视区域
    this.topInvisibleItemCount = 0; // 上方不可视区域
    this.bottomInvisibleItemCount = 0; // 下方不可视区域
    this.visibleHeight = 0; // 可视区域高度

    this.from = 0;
    this.to = 0;

    // __DEV__ && window.scrollList = this;

    this.handleScroll = debounce(this.handleScroll, 16.8);
  }

  componentDidMount() {
    this.initSetting();
    this.handleScroll();
  }

  initSetting() {
    const { itemHeight } = this.props;
    const conHeight = this.containerRef.current.offsetHeight;
    // 按照 2 : 1 : 1 设定
    this.visibleItemCount = Math.ceil(conHeight / itemHeight);
    this.topInvisibleItemCount = this.visibleItemCount * 2;
    this.bottomInvisibleItemCount = this.visibleItemCount;
    this.visibleHeight = this.visibleItemCount * itemHeight;
  }

  handleScroll = () => {
    const container = this.containerRef.current;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.offsetHeight;
    const listHeight = this.listRef.current.offsetHeight;

    const { itemHeight, list = [] } = this.props;

    // const scrollItems = containerScrollTop / itemHeight;
    // if (containerScrollTop / itemHeight - Math.floor(scrollItems) > 0.5) {
    //   this.setState({
    //     displayCount: Math.ceil(scrollItems),
    //   });
    // }
    // else {
    //   this.setState({
    //     displayCount: Math.floor(scrollItems),
    //   });
    // }

    if (this.state.lastScrollTop === null || Math.abs(containerScrollTop - this.state.lastScrollTop) > this.visibleHeight) {
      this.setState({
        lastScrollTop: containerScrollTop,
      });
    }
    else {
      const { list = [], couldScroll } = this.props;
      if (this.to === list.length && listHeight - containerScrollTop - containerHeight < itemHeight) {
        couldScroll && this.handleLoadMore(this.from, this.to);
      }
      return;
    }

    let from = parseInt(containerScrollTop / itemHeight) - this.topInvisibleItemCount;
    if (from < 0) {
      from = 0;
    }

    let to = from + this.topInvisibleItemCount + this.bottomInvisibleItemCount + this.visibleItemCount;
    if (to > list.length) {
      to = list.length;
    }

    this.from = from;
    this.to = to;

    this.setState({
      listPaddingTop: from * itemHeight,
      listPaddingBottom: (list.length - to) * itemHeight,
    });

    this.setPreviewList(from, to);
  }

  handleLoadMore(from, to) {
    const { loadMore } = this.props;
    if ('function' === typeof loadMore) {
      loadMore(from, to);
    }
  }

  setPreviewList(from, to) {
    const { list = [] } = this.props;
    this.setState({
      visibleList: list.slice(from, to),
    });
  }

  render() {
    const {
      listPaddingTop,
      listPaddingBottom,
      visibleList = [],
      scrollLoading = false,
    } = this.state;
    return (
      <React.Fragment>
        <div
          ref={this.containerRef}
          onScroll={this.handleScroll}
          className="scroll-container">
          <ul
            ref={this.listRef}
            className="list"
            style={
              { paddingTop: listPaddingTop, paddingBottom: listPaddingBottom }
            }>
            {visibleList.map((item) => {
              return <li key={item.id}>{`${item.title}_${item.id}`}</li>
            })}
          </ul>
        </div>
        {/* <div className={`loading-mask ${scrollLoading ? 'show' : 'hide' }`}>加载中。。。</div> */}
      </React.Fragment>
    )
  }
}

class App extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  getList() {
    const list = [];
    for (let i = 0; i < 200; i++) {
      list.push({
        id: i + 1,
        title: `item-${i + 1}`,
      });
    }

    return list;
  }
  render() {
    return (<div className="list-container">
      <ScrollList list={this.getList()} />
    </div>);
  }
}
ReactDOM.render(<App />, document.getElementById('app'));