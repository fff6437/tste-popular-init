let { useState, useEffect } = React;
        const searchKeys = [
            { name: 'All', key: 'stars:%3E1' },
            { name: 'Javascript', key: 'stars:%3E1+language:javascript' },
            { name: 'Ruby', key: 'stars:%3E1+language:ruby' },
            { name: 'Java', key: 'stars:%3E1+language:java' },
            { name: 'CSS', key: 'stars:%3E1+language:css' },
        ];
        const Header = (props) => {
            let [checkedName, setCheckedName] = useState('All');
            useEffect(() => {
                setCheckedName(props.urlNmae);
            }, [props.urlNmae])
            const getKeysInfo = (v) => {
                if (v.name === checkedName) return;
                setCheckedName(v.name);
                props.getStarList(v.key);
            }
            return (
                <div className='header'>
                    {searchKeys.map((v, i) => {
                        return <a key={i} href={`#/popular?key=${v.name}`} className={`${checkedName === v.name ? 'checked' : ''} item`} onClick={() => getKeysInfo(v)}>{v.name}</a>
                    })}
                </div>
            )
        }
        const Content = (props) => {
            let [page, setPage] = useState(1);
            let [data, setData] = useState([]);
            let [getDataLoding, setDataLoding] = useState(false);
            let [loading, setLoading] = useState(false);
            let [error, setError] = useState(false);
            let [errorInfo, setErrorInfo] = useState(null);
            const [showBtn, setShowBtn] = useState(false);
            const getStarList = (key, page, isMore = true) => {
                if (getDataLoding) return;
                setDataLoding(true);
                setPage(++page)
                if (!isMore) {
                    setLoading(true)
                }
                axios.get(`https://api.github.com/search/repositories?q=${key}&sort=stars&order=desc&type=Repositories&page=${page}`).then(function (res) {
                    if (res.status === 200) {
                        if (isMore) {
                            setData([...data, ...res.data.items]);
                        } else {
                            setData(res.data.items);
                            setLoading(false);
                        }
                    }
                    setDataLoding(false);
                }).catch((error) => {
                    setDataLoding(false);
                    setLoading(false);
                    setErrorInfo(error.response.data.message);
                    setError(true);
                })
            }

            const backTop = () => {
                document.documentElement.scrollTop = 0
            }

            window.onscroll = function () {
                //变量scrollTop是滚动条滚动时，距离顶部的距离
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                // //变量windowHeight是可视区的高度
                // var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
                // //变量scrollHeight是滚动条的总高度
                // var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                // //滚动条到底部的条件
                // if (scrollTop + windowHeight == scrollHeight) {
                //     //写后台加载数据的函数
                //     // console.log("距顶部" + scrollTop + "可视区高度" + windowHeight + "滚动条总高度" + scrollHeight);
                //     getStarList(props.urlKey, page);
                // }
                if (scrollTop === 0) {
                    setShowBtn(false);
                } else if (scrollTop > 200) {
                    setShowBtn(true);
                }
            }

            useEffect(() => {
                setData([]);
                setPage(1);
                setDataLoding(false);
                setLoading(false);
                setError(false);
                if (props.urlKey) {
                    getStarList(props.urlKey, 0, false);
                }
            }, [props.urlKey])
            return (<div className='list'>
                {loading &&
                    <div className="loader">
                        <div className="loader-inner">
                            <div className="loader-line-wrap">
                                <div className="loader-line"></div>
                            </div>
                            <div className="loader-line-wrap">
                                <div className="loader-line"></div>
                            </div>
                            <div className="loader-line-wrap">
                                <div className="loader-line"></div>
                            </div>
                            <div className="loader-line-wrap">
                                <div className="loader-line"></div>
                            </div>
                            <div className="loader-line-wrap">
                                <div className="loader-line"></div>
                            </div>
                        </div>
                    </div>}
                {!error ? <div className='center'>{data && data.map((v, i) => {
                    const {
                        forks,
                        open_issues,
                        stargazers_count,
                        // name,
                        owner: { avatar_url, login }
                    } = v;
                    return <div key={i} className='list-content'>
                        <div className='ranking'>#{i + 1}</div>
                        <div className='img'>
                            <img src={avatar_url} alt="" />
                        </div>
                        <div className="list-name">{login}</div>
                        <div className='list-info'>
                            <i className="fa fa-user"
                                style={{
                                    color: "green",
                                    width: "20px",
                                    marginRight: '5px',
                                }}></i>{login}</div>
                        <div className='list-info'>
                            <i className="fa fa-star"
                                style={{
                                    color: "yellow",
                                    width: "20px",
                                    marginRight: '5px',
                                }}></i>{stargazers_count} stars</div>
                        <div className='list-info'>
                            <i className="fa fa-code-fork"
                                style={{
                                    color: "blue",
                                    width: "20px",
                                    marginRight: '5px',
                                }}></i>{forks} forks</div>
                        <div className='list-info'>
                            <i className="fa fa-exclamation-triangle"
                                style={{
                                    color: "pink",
                                    width: "20px",
                                    marginRight: '5px',
                                }}></i>{open_issues} open issues</div>
                    </div>
                })} </div> :
                    error && <div className='errorModal'>
                        <p>{errorInfo ? errorInfo : '加载失败，请稍后再试...'}</p>
                        <span onClick={() => { setError(false) }}>×</span>
                    </div>}
                {showBtn && !error && <button id='backTop' onClick={backTop} type='button'>回到顶部</button>}
                {!loading && <button id='getMore' disabled={getDataLoding} onClick={() => {getStarList(props.urlKey, page)}}>{getDataLoding ? 'LOADING...' : '加载更多'}</button>}
            </div>)
        }
        function App(props) {
            let [urlKey, setKey] = useState('');
            const [urlNmae, setUrlNmae] = useState("All");
            const [error, setError] = useState(false);
            const getTag = () => {
                const hash = window.location.hash.slice(2);
                if (hash) {
                    if (hash.indexOf("popular") > -1) {
                        const keys = hash.slice(12);
                        if (hash === 'popular') {
                            setKey("stars:%3E1");
                            setUrlNmae('All');
                            return;
                        }
                        switch (keys) {
                            case 'All':
                                setKey("stars:%3E1");
                                setUrlNmae('All');
                                break;
                            case 'Javascript':
                                setKey("stars:%3E1+language:javascript");
                                setUrlNmae('Javascript');
                                break;
                            case 'Ruby':
                                setKey("stars:%3E1+language:ruby");
                                setUrlNmae('Ruby');
                                break;
                            case 'Java':
                                setKey("stars:%3E1+language:java");
                                setUrlNmae('Java');
                                break;
                            case 'CSS':
                                setKey("stars:%3E1+language:css");
                                setUrlNmae('CSS');
                                break;
                            default:
                                setError(true);
                                break;
                        }
                    } else {
                        setError(true);
                    }
                } else {
                    setKey("stars:%3E1");
                    setUrlNmae('All');
                }
            }
            useEffect(() => {
                getTag();
            },[]);
            useEffect(() => {
                window.addEventListener("hashchange", () => {
                    getTag();
                });
            });
            return !error ? <div id='root'>
                <Header getStarList={(key) => setKey(key)} urlNmae={urlNmae} />
                <Content urlKey={urlKey} />
            </div> : <div className='not-found'>404 Not Found</div>
        }

        ReactDOM.render(
            <App />,
            document.getElementById('container') //指明插⼊位置
        )