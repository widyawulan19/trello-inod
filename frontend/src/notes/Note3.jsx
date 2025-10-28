<DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd} // 🔹 untuk LIST drag
  onDragStart={(e) => setActiveId(e.active.id)}
  onDragCancel={() => setActiveId(null)}
>
  <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
    <div className="bl-content">
      {lists.map((list) => (
        <SortableListItem key={list.id} id={list.id}>
          {({ dragHandleProps }) => (
            <div key={list.id} className="bl-card">
              <div className="bl-box">
                <div className="list-title">
                  <div className="icon-i" {...dragHandleProps}>
                    <HiMiniListBullet className="licon" />
                  </div>
                  <h5>{list.name}</h5>
                </div>

                {/* 🔽 Tambahkan DndContext baru untuk Card */}
                <DndContext
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleCardDragEnd}
                >
                  <SortableContext items={(cards[list.id] || []).map((c) => c.id)}>
                    <div className="list-body">
                      {cards[list.id]?.map((card) => (
                        <SortableCardItem key={card.id} id={card.id} data={{ listId: list.id }}>
                          {({ dragHandleCardProps }) => (
                            <Card
                              key={card.id}
                              card={card}
                              listId={list.id}
                              dragHandleCardProps={dragHandleCardProps}
                              userId={userId}
                              fetchBoardDetail={fetchBoardDetail}
                              fetchLists={fetchLists}
                              fetchCardList={fetchCardList}
                            />
                          )}
                        </SortableCardItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </SortableListItem>
      ))}
    </div>
  </SortableContext>
</DndContext>
