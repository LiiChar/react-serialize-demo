import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import './App.css'

let items = Array.from({ length: 10000 }, (_, index) => ({
  id: Math.random().toString(36).slice(2),
  text: String(index)
}))

const conteinerHeight = 450;
const itemHieght = 40;
const overscan = 3;
const scrollingDelay = 100

function App() {
  const [listItem, setListItem] = useState(items);
  const [scrollTop, setScrollTop] = useState(0);
  const [isSrolling, setIsScrolling] = useState(false);
  const [countElement, setCountElement] = useState(10000);

  useEffect(() => {
    items = Array.from({ length: countElement }, (_, index) => ({
      id: Math.random().toString(36).slice(2),
      text: String(index)
    }));

    setListItem(items)
    
  }, [countElement])

  const scrollElementRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const scrollElement = scrollElementRef.current;

    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      setScrollTop(scrollElement.scrollTop)
    }

    handleScroll();

    scrollElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;

    if (!scrollElement) {
      return;
    }

    let timeoutId: number | null = null;
    const handleScroll = () => {
      setIsScrolling(true);

      if (typeof timeoutId === "number") {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay)
    }


    scrollElement.addEventListener('scroll', handleScroll);

    return () => {
      if (typeof timeoutId === "number") {
        clearTimeout(timeoutId)
      }

      scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const virtualItems = useMemo(() => {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + conteinerHeight

    let startIndex = Math.floor(rangeStart / itemHieght);
    let endIndex = Math.ceil(rangeEnd / itemHieght);

    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(listItem.length - 1, endIndex + overscan);

    const virtualItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHieght
      })
    }

    return virtualItems;
  }, [scrollTop, listItem.length]);

  const addElementToList = () => {
    setCountElement(prev => prev += 1)
  }

  const deleteElementToList = () => {
    setCountElement(prev => prev -= 1)
  }

  return (
    <div style={{ padding: "0 10px 0 10px" }}>
      <h1>List with {countElement} items</h1>
      <div>
        <button onClick={() => setListItem((items) => items.slice().reverse())}>reverce</button>
        <button style={{margin: "0 10px 0 10px"}} onClick={addElementToList}>AddElement</button>
        <button onClick={deleteElementToList}>RemoveElemnt</button>
      </div>
      <div ref={scrollElementRef} style={{ position: "relative", height: `${conteinerHeight}px`, overflow: "auto", margin: '20px 0 20px 0', border: '2px solid black' }}>
        <div style={{ height: itemHieght * listItem.length, paddingLeft: "20px" }}>
          {
            virtualItems.map((virtualItem) => {
              const item = listItem[virtualItem.index]!;

              return (
                <div style={{ height: itemHieght, position: "absolute", top: 0, transform: `translateY(${virtualItem.offsetTop}px)` }} key={item.id}>
                  {isSrolling ? "Scrolling..." : +item.text + 1}
                </div>
              )
            }
            )
          }
        </div>
      </div>
    </div>
  )
}

export default App
