import { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MarkerType,
  useReactFlow,
  NodeProps,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Plus, Settings2, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Track,
  Step,
  Milestone,
  PresentationStep,
  TaskStep,
  SurveyStep,
  ContentSlide,
  QuizSlide,
  FormComponent,
} from '@/types'

interface TrackFlowEditorProps {
  onSave: (track: Track) => void
  initialTrack?: Track
}

function StartNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-md">
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
        isConnectable={true}
      />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
          </svg>
        </div>
        <span className="font-medium">{data.label}</span>
      </div>
    </div>
  )
}

function StepNode({ data, isConnectable, selected }: NodeProps<{ label: string; type: Step['type']; description: string }>) {
  return (
    <div className={`rounded-lg border bg-card p-4 shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          {data.type === 'presentation' ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M8 10h8M8 14h8M8 18h4" />
            </svg>
          ) : data.type === 'task' ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">{data.label}</div>
          {data.description && (
            <div className="mt-1 text-sm text-muted-foreground">{data.description}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  start: StartNode,
  presentation: StepNode,
  task: StepNode,
  survey: StepNode,
}

export function TrackFlowEditor({ onSave, initialTrack }: TrackFlowEditorProps) {
  return (
    <ReactFlowProvider>
      <TrackFlowEditorContent onSave={onSave} initialTrack={initialTrack} />
    </ReactFlowProvider>
  )
}

function TrackFlowEditorContent({ onSave, initialTrack }: TrackFlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [trackTitle, setTrackTitle] = useState(initialTrack?.title || '')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [milestones, setMilestones] = useState<Array<{ id: string; title: string; description: string }>>(
    initialTrack?.milestones.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description
    })) || []
  )
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const { getNode } = useReactFlow()

  // Инициализация редактора с существующим треком
  useEffect(() => {
    if (initialTrack) {
      // Создаем ноды для каждой вехи
      const initialNodes: Node[] = []
      const initialEdges: Edge[] = []
      let yOffset = 0

      initialTrack.milestones.forEach((milestone, milestoneIndex) => {
        // Добавляем начальную ноду для вехи
        const startNode: Node = {
          id: `start-${milestone.id}`,
          type: 'start',
          position: { x: 250, y: yOffset },
          data: { label: milestone.title },
        }
        initialNodes.push(startNode)

        // Добавляем ноды для каждого шага
        let xOffset = 450
        milestone.steps.forEach((step, stepIndex) => {
          const stepNode: Node = {
            id: step.id,
            type: step.type,
            position: { x: xOffset, y: yOffset },
            data: {
              label: step.title,
              type: step.type,
              description: step.description,
              content: step.content
            },
          }
          initialNodes.push(stepNode)

          // Создаем связи между шагами
          if (stepIndex === 0) {
            // Связь от начальной ноды к первому шагу
            initialEdges.push({
              id: `e-${startNode.id}-${step.id}`,
              source: startNode.id,
              target: step.id,
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: '#94a3b8' },
            })
          } else {
            // Связь между шагами
            const prevStep = milestone.steps[stepIndex - 1]
            initialEdges.push({
              id: `e-${prevStep.id}-${step.id}`,
              source: prevStep.id,
              target: step.id,
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: '#94a3b8' },
            })
          }

          xOffset += 200
        })

        yOffset += 300
      })

      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }, [initialTrack])

  const addMilestone = useCallback(() => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      title: `Веха ${milestones.length + 1}`,
      description: '',
    }
    setMilestones([...milestones, newMilestone])
    setSelectedMilestone(newMilestone.id)

    // Добавляем начальную ноду для вехи
    const startNode: Node = {
      id: `start-${newMilestone.id}`,
      type: 'start',
      position: { x: 250, y: milestones.length * 300 },
      data: { label: newMilestone.title },
    }

    setNodes((nds) => [...nds, startNode])
  }, [milestones, setNodes])

  const addNodeToMilestone = useCallback(
    (type: Step['type']) => {
      if (!selectedMilestone) return

      console.log('Adding node to milestone:', selectedMilestone)
      console.log('Current nodes:', nodes)
      console.log('Current edges:', edges)

      // Находим все ноды, принадлежащие вехе
      const milestoneNodes = nodes.filter(node => {
        // Начальная нода вехи
        if (node.id === `start-${selectedMilestone}`) return true

        // Проверяем, связана ли нода с начальной нодой вехи через цепочку связей
        const isConnectedToStart = (nodeId: string): boolean => {
          // Прямая связь с начальной нодой
          if (edges.some(e => e.source === `start-${selectedMilestone}` && e.target === nodeId)) {
            return true
          }

          // Находим все входящие связи
          const incomingEdges = edges.filter(e => e.target === nodeId)
          return incomingEdges.some(e => isConnectedToStart(e.source))
        }

        return isConnectedToStart(node.id)
      })

      console.log('Milestone nodes:', milestoneNodes)

      // Находим последний этап в последовательности
      const lastNode = milestoneNodes
        .filter(node => node.type !== 'start' && !edges.some(e => e.source === node.id))
        .sort((a, b) => b.position.x - a.position.x)[0]

      console.log('Last node in sequence:', lastNode)

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: lastNode ? {
          x: lastNode.position.x + 200,
          y: lastNode.position.y,
        } : {
          x: 450,
          y: milestones.findIndex(m => m.id === selectedMilestone) * 300,
        },
        data: {
          label: type === 'presentation' ? 'Презентация' : type === 'task' ? 'Задача' : 'Опрос',
          type,
          description: '',
          content: type === 'presentation'
            ? { slides: [], theme: 'light', defaultLayout: 'default' }
            : type === 'task'
            ? { description: '', meeting: undefined }
            : type === 'survey'
            ? {
                title: '',
                description: '',
                form: { components: [] },
              }
            : undefined,
        },
      }

      console.log('New node:', newNode)

      setNodes((nds) => [...nds, newNode])

      // Связываем с последним этапом в последовательности
      if (lastNode) {
        console.log('Connecting to last node:', lastNode.id)
        setEdges((eds) =>
          addEdge(
            {
              id: `e-${lastNode.id}-${newNode.id}`,
              source: lastNode.id,
              target: newNode.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              style: { stroke: '#94a3b8' },
            },
            eds
          )
        )
      } else {
        // Если это первый этап, связываем с начальной нодой
        const startNode = nodes.find(n => n.id === `start-${selectedMilestone}`)
        console.log('No last node found, connecting to start node:', startNode?.id)
        if (startNode) {
          setEdges((eds) =>
            addEdge(
              {
                id: `e-${startNode.id}-${newNode.id}`,
                source: startNode.id,
                target: newNode.id,
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
                style: { stroke: '#94a3b8' },
              },
              eds
            )
          )
        }
      }
    },
    [selectedMilestone, nodes, edges, setNodes, setEdges, milestones]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      // Проверяем, что у ноды нет других исходящих связей
      const hasOutgoingEdge = edges.some(edge => edge.source === params.source)
      if (hasOutgoingEdge) return

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: { stroke: '#94a3b8' },
          },
          eds
        )
      )
    },
    [setEdges, edges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    )
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    )
  }, [])

  const moveMilestone = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === milestones.length - 1)
    ) return

    const newMilestones = [...milestones]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newMilestones[index], newMilestones[newIndex]] = [newMilestones[newIndex], newMilestones[index]]
    setMilestones(newMilestones)

    // Обновляем позиции нод
    setNodes((nds) =>
      nds.map((node) => {
        const milestoneIndex = newMilestones.findIndex(m => node.id.startsWith(`start-${m.id}`))
        if (milestoneIndex === -1) return node

        const isInMilestone = edges.some((edge) => {
          const isConnected = (nodeId: string, targetId: string): boolean => {
            const directEdge = edges.find(e => e.source === nodeId && e.target === targetId)
            if (directEdge) return true
            
            const incomingEdges = edges.filter(e => e.target === nodeId)
            return incomingEdges.some(e => isConnected(e.source, targetId))
          }
          return isConnected(node.id, `start-${newMilestones[milestoneIndex].id}`)
        })

        if (isInMilestone) {
          return {
            ...node,
            position: {
              ...node.position,
              y: milestoneIndex * 300,
            },
          }
        }
        return node
      })
    )
  }, [milestones, setMilestones, setNodes, edges])

  const handleSave = () => {
    const track: Track = {
      id: 'new-track',
      title: trackTitle,
      milestones: milestones.map((milestone) => {
        // Находим все ноды, принадлежащие вехе
        const milestoneNodes = nodes.filter((node) => {
          if (node.id === `start-${milestone.id}`) return true
          const isConnectedToStart = (nodeId: string): boolean => {
            if (edges.some((e) => e.source === `start-${milestone.id}` && e.target === nodeId)) {
              return true
            }
            const incomingEdges = edges.filter((e) => e.target === nodeId)
            return incomingEdges.some((e) => isConnectedToStart(e.source))
          }
          return isConnectedToStart(node.id)
        })

        // Сортируем ноды по их позиции X
        const sortedNodes = milestoneNodes
          .filter((node) => node.type !== 'start')
          .sort((a, b) => a.position.x - b.position.x)

        return {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          steps: sortedNodes.map((node) => {
            const nodeData = node.data
            if (node.type === 'presentation') {
              return {
                id: node.id,
                type: 'presentation' as const,
                title: nodeData.label,
                description: nodeData.description || '',
                content: {
                  slides: nodeData.content?.slides || []
                }
              } as PresentationStep
            } else if (node.type === 'task') {
              return {
                id: node.id,
                type: 'task' as const,
                title: nodeData.label,
                description: nodeData.description || '',
                content: {
                  description: nodeData.content?.description || '',
                  meeting: nodeData.content?.meeting
                }
              } as TaskStep
            } else {
              return {
                id: node.id,
                type: 'survey' as const,
                title: nodeData.label,
                description: nodeData.description || '',
                content: {
                  title: nodeData.content?.title || '',
                  description: nodeData.content?.description || '',
                  form: {
                    components: nodeData.content?.form?.components || []
                  }
                }
              } as SurveyStep
            }
          }),
        }
      }),
    }

    onSave(track)
  }

  return (
    <div className="h-screen w-full flex flex-col px-6">
      <div className="border-b bg-background p-6">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">Редактирование трека</h2>
              <p className="text-sm text-muted-foreground">
                Создание и редактирование адаптационных треков для новых сотрудников
              </p>
            </div>
            <Button onClick={handleSave} disabled={!trackTitle || milestones.length === 0} size="lg">
              <Save className="mr-2 h-5 w-5" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-[2000px] mx-auto w-full">
        {/* Левая панель с вехами */}
        <div className="w-[400px] border-r bg-background p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Название трека</h3>
              <Input
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Например: Адаптация разработчика"
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Вехи адаптации</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить веху
                </Button>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`rounded-lg border p-4 ${
                      selectedMilestone === milestone.id ? 'border-primary bg-primary/5' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Веха {index + 1}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveMilestone(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveMilestone(index, 'down')}
                            disabled={index === milestones.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMilestone(milestone.id)}
                      >
                        {selectedMilestone === milestone.id ? 'Редактировать этапы' : 'Выбрать для редактирования'}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          setMilestones(
                            milestones.map((m) =>
                              m.id === milestone.id ? { ...m, title: e.target.value } : m
                            )
                          )
                        }}
                        placeholder="Название вехи"
                      />
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => {
                          setMilestones(
                            milestones.map((m) =>
                              m.id === milestone.id ? { ...m, description: e.target.value } : m
                            )
                          )
                        }}
                        placeholder="Описание вехи..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {selectedMilestone === milestone.id && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Добавить этап:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addNodeToMilestone('presentation')}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <path d="M8 10h8M8 14h8M8 18h4" />
                            </svg>
                            Презентация
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addNodeToMilestone('task')}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 11l3 3L22 4" />
                              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            Задача
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addNodeToMilestone('survey')}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                              <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Опрос
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Основное поле с графом */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Правая панель с настройками */}
        {selectedNode && (
          <div className="w-[400px] border-l bg-background p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Настройки {selectedNode.data.label}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedNode(null)
                    setNodes((nds) =>
                      nds.map((n) => ({
                        ...n,
                        selected: false,
                      }))
                    )
                  }}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      setNodes((nds) => {
                        const updatedNodes = nds.map((n) => {
                          if (n.id === selectedNode.id) {
                            const updatedNode = {
                              ...n,
                              data: { ...n.data, label: e.target.value },
                            }
                            setSelectedNode(updatedNode)
                            return updatedNode
                          }
                          return n
                        })
                        return updatedNodes
                      })
                    }}
                  />
                </div>

                {selectedNode.type !== 'start' && (
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={selectedNode.data.description || ''}
                      onChange={(e) => {
                        setNodes((nds) => {
                          const updatedNodes = nds.map((n) => {
                            if (n.id === selectedNode.id) {
                              const updatedNode = {
                                ...n,
                                data: { ...n.data, description: e.target.value },
                              }
                              setSelectedNode(updatedNode)
                              return updatedNode
                            }
                            return n
                          })
                          return updatedNodes
                        })
                      }}
                      placeholder="Добавьте описание..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {selectedNode.type === 'presentation' && (
                  <div className="space-y-2">
                    <Label>Слайды</Label>
                    <div className="space-y-2">
                      {selectedNode.data.content.slides.map((slide: ContentSlide | QuizSlide, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg border bg-card p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Слайд {index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNodes((nodes) =>
                                  nodes.map((n) =>
                                    n.id === selectedNode.id
                                      ? {
                                          ...n,
                                          data: {
                                            ...n.data,
                                            content: {
                                              ...n.data.content,
                                              slides: n.data.content.slides.filter(
                                                (_: ContentSlide | QuizSlide, i: number) => i !== index
                                              ),
                                            },
                                          },
                                        }
                                      : n
                                  )
                                )
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 space-y-4">
                            <div>
                              <Label>Заголовок</Label>
                              <Input
                                value={slide.title}
                                onChange={(e) => {
                                  setNodes((nodes) =>
                                    nodes.map((n) =>
                                      n.id === selectedNode.id
                                        ? {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                slides: n.data.content.slides.map(
                                                  (s: ContentSlide | QuizSlide, i: number) =>
                                                    i === index ? { ...s, title: e.target.value } : s
                                                ),
                                              },
                                            },
                                          }
                                        : n
                                    )
                                  )
                                }}
                              />
                            </div>
                            {'type' in slide && slide.type === 'quiz' ? (
                              <>
                                <div>
                                  <Label>Вопрос</Label>
                                  <Textarea
                                    value={slide.content.question}
                                    onChange={(e) => {
                                      setNodes((nodes) =>
                                        nodes.map((n) =>
                                          n.id === selectedNode.id
                                            ? {
                                                ...n,
                                                data: {
                                                  ...n.data,
                                                  content: {
                                                    ...n.data.content,
                                                    slides: n.data.content.slides.map(
                                                      (s: ContentSlide | QuizSlide, i: number) =>
                                                        i === index && 'type' in s && s.type === 'quiz'
                                                          ? {
                                                              ...s,
                                                              content: {
                                                                ...s.content,
                                                                question: e.target.value,
                                                              },
                                                            }
                                                          : s
                                                    ),
                                                  },
                                                },
                                              }
                                            : n
                                        )
                                      )
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Варианты ответов</Label>
                                  {slide.content.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className="mt-2 flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          setNodes((nodes) =>
                                            nodes.map((n) =>
                                              n.id === selectedNode.id
                                                ? {
                                                    ...n,
                                                    data: {
                                                      ...n.data,
                                                      content: {
                                                        ...n.data.content,
                                                        slides: n.data.content.slides.map(
                                                          (s: ContentSlide | QuizSlide, i: number) =>
                                                            i === index && 'type' in s && s.type === 'quiz'
                                                              ? {
                                                                  ...s,
                                                                  content: {
                                                                    ...s.content,
                                                                    options: s.content.options.map(
                                                                      (opt: string, j: number) =>
                                                                        j === optionIndex ? e.target.value : opt
                                                                    ),
                                                                  },
                                                                }
                                                              : s
                                                        ),
                                                      },
                                                    },
                                                  }
                                                : n
                                            )
                                          )
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setNodes((nodes) =>
                                            nodes.map((n) =>
                                              n.id === selectedNode.id
                                                ? {
                                                    ...n,
                                                    data: {
                                                      ...n.data,
                                                      content: {
                                                        ...n.data.content,
                                                        slides: n.data.content.slides.map(
                                                          (s: ContentSlide | QuizSlide, i: number) =>
                                                            i === index && 'type' in s && s.type === 'quiz'
                                                              ? {
                                                                  ...s,
                                                                  content: {
                                                                    ...s.content,
                                                                    options: s.content.options.filter(
                                                                      (_: string, j: number) => j !== optionIndex
                                                                    ),
                                                                  },
                                                                }
                                                              : s
                                                        ),
                                                      },
                                                    },
                                                  }
                                                : n
                                            )
                                          )
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                      setNodes((nodes) =>
                                        nodes.map((n) =>
                                          n.id === selectedNode.id
                                            ? {
                                                ...n,
                                                data: {
                                                  ...n.data,
                                                  content: {
                                                    ...n.data.content,
                                                    slides: n.data.content.slides.map(
                                                      (s: ContentSlide | QuizSlide, i: number) =>
                                                        i === index && 'type' in s && s.type === 'quiz'
                                                          ? {
                                                              ...s,
                                                              content: {
                                                                ...s.content,
                                                                options: [...s.content.options, ''],
                                                              },
                                                            }
                                                          : s
                                                    ),
                                                  },
                                                },
                                              }
                                            : n
                                        )
                                      )
                                    }}
                                  >
                                    Добавить вариант
                                  </Button>
                                </div>
                                <div>
                                  <Label>Правильный ответ</Label>
                                  <select
                                    value={slide.content.correctAnswer}
                                    onChange={(e) => {
                                      setNodes((nodes) =>
                                        nodes.map((n) =>
                                          n.id === selectedNode.id
                                            ? {
                                                ...n,
                                                data: {
                                                  ...n.data,
                                                  content: {
                                                    ...n.data.content,
                                                    slides: n.data.content.slides.map(
                                                      (s: ContentSlide | QuizSlide, i: number) =>
                                                        i === index && 'type' in s && s.type === 'quiz'
                                                          ? {
                                                              ...s,
                                                              content: {
                                                                ...s.content,
                                                                correctAnswer: parseInt(e.target.value),
                                                              },
                                                            }
                                                          : s
                                                    ),
                                                  },
                                                },
                                              }
                                            : n
                                        )
                                      )
                                    }}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  >
                                    {slide.content.options.map((option: string, i: number) => (
                                      <option key={i} value={i}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            ) : (
                              <div>
                                <Label>Содержимое</Label>
                                <Textarea
                                  value={typeof slide.content === 'string' ? slide.content : ''}
                                  onChange={(e) => {
                                    setNodes((nodes) =>
                                      nodes.map((n) =>
                                        n.id === selectedNode.id
                                          ? {
                                              ...n,
                                              data: {
                                                ...n.data,
                                                content: {
                                                  ...n.data.content,
                                                  slides: n.data.content.slides.map(
                                                    (s: ContentSlide | QuizSlide, i: number) =>
                                                      i === index && !('type' in s)
                                                        ? { ...s, content: e.target.value }
                                                        : s
                                                  ),
                                                },
                                              },
                                            }
                                          : n
                                      )
                                    )
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('Adding new slide to node:', selectedNode.id)
                            setNodes((nds) => {
                              const updatedNodes = nds.map((n) => {
                                if (n.id === selectedNode.id) {
                                  const newSlide = {
                                    type: 'content' as const,
                                    title: 'Новый слайд',
                                    content: {
                                      text: '',
                                      image: undefined,
                                    },
                                  }
                                  const updatedNode = {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      content: {
                                        ...n.data.content,
                                        slides: [...n.data.content.slides, newSlide],
                                      },
                                    },
                                  }
                                  setSelectedNode(updatedNode)
                                  return updatedNode
                                }
                                return n
                              })
                              console.log('Updated nodes after adding slide:', updatedNodes)
                              return updatedNodes
                            })
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Добавить слайд
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('Adding new test to node:', selectedNode.id)
                            setNodes((nds) => {
                              const updatedNodes = nds.map((n) => {
                                if (n.id === selectedNode.id) {
                                  const newTest = {
                                    type: 'quiz' as const,
                                    title: 'Новый тест',
                                    content: {
                                      question: '',
                                      options: [''],
                                    },
                                  }
                                  const updatedNode = {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      content: {
                                        ...n.data.content,
                                        slides: [...n.data.content.slides, newTest],
                                      },
                                    },
                                  }
                                  setSelectedNode(updatedNode)
                                  return updatedNode
                                }
                                return n
                              })
                              console.log('Updated nodes after adding test:', updatedNodes)
                              return updatedNodes
                            })
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Добавить тест
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'task' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Описание задачи</Label>
                      <Textarea
                        value={selectedNode.data.content.description}
                        onChange={(e) => {
                          setNodes((nds) => {
                            const updatedNodes = nds.map((n) => {
                              if (n.id === selectedNode.id) {
                                const updatedNode = {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    content: {
                                      ...n.data.content,
                                      description: e.target.value,
                                    },
                                  },
                                }
                                setSelectedNode(updatedNode)
                                return updatedNode
                              }
                              return n
                            })
                            return updatedNodes
                          })
                        }}
                        placeholder="Опишите задачу..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Встреча</Label>
                      <div className="space-y-2">
                        {selectedNode.data.content.meeting ? (
                          <div className="rounded-md border bg-card p-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Место встречи</Label>
                                <Input
                                  value={selectedNode.data.content.meeting.location}
                                  onChange={(e) => {
                                    setNodes((nds) => {
                                      const updatedNodes = nds.map((n) => {
                                        if (n.id === selectedNode.id) {
                                          const updatedNode = {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                meeting: {
                                                  ...n.data.content.meeting,
                                                  location: e.target.value,
                                                },
                                              },
                                            },
                                          }
                                          setSelectedNode(updatedNode)
                                          return updatedNode
                                        }
                                        return n
                                      })
                                      return updatedNodes
                                    })
                                  }}
                                  placeholder="Введите место встречи"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Дата</Label>
                                <Input
                                  type="date"
                                  value={selectedNode.data.content.meeting.date}
                                  onChange={(e) => {
                                    setNodes((nds) => {
                                      const updatedNodes = nds.map((n) => {
                                        if (n.id === selectedNode.id) {
                                          const updatedNode = {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                meeting: {
                                                  ...n.data.content.meeting,
                                                  date: e.target.value,
                                                },
                                              },
                                            },
                                          }
                                          setSelectedNode(updatedNode)
                                          return updatedNode
                                        }
                                        return n
                                      })
                                      return updatedNodes
                                    })
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Время</Label>
                                <Input
                                  type="time"
                                  value={selectedNode.data.content.meeting.time}
                                  onChange={(e) => {
                                    setNodes((nds) => {
                                      const updatedNodes = nds.map((n) => {
                                        if (n.id === selectedNode.id) {
                                          const updatedNode = {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                meeting: {
                                                  ...n.data.content.meeting,
                                                  time: e.target.value,
                                                },
                                              },
                                            },
                                          }
                                          setSelectedNode(updatedNode)
                                          return updatedNode
                                        }
                                        return n
                                      })
                                      return updatedNodes
                                    })
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Длительность</Label>
                                <Input
                                  value={selectedNode.data.content.meeting.duration}
                                  onChange={(e) => {
                                    setNodes((nds) => {
                                      const updatedNodes = nds.map((n) => {
                                        if (n.id === selectedNode.id) {
                                          const updatedNode = {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                meeting: {
                                                  ...n.data.content.meeting,
                                                  duration: e.target.value,
                                                },
                                              },
                                            },
                                          }
                                          setSelectedNode(updatedNode)
                                          return updatedNode
                                        }
                                        return n
                                      })
                                      return updatedNodes
                                    })
                                  }}
                                  placeholder="Например: 1 час"
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setNodes((nds) => {
                                    const updatedNodes = nds.map((n) => {
                                      if (n.id === selectedNode.id) {
                                        const updatedNode = {
                                          ...n,
                                          data: {
                                            ...n.data,
                                            content: {
                                              ...n.data.content,
                                              meeting: undefined,
                                            },
                                          },
                                        }
                                        setSelectedNode(updatedNode)
                                        return updatedNode
                                      }
                                      return n
                                    })
                                    return updatedNodes
                                  })
                                }}
                              >
                                Удалить встречу
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setNodes((nds) => {
                                const updatedNodes = nds.map((n) => {
                                  if (n.id === selectedNode.id) {
                                    const updatedNode = {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        content: {
                                          ...n.data.content,
                                          meeting: {
                                            location: '',
                                            participants: [],
                                            date: '',
                                            time: '',
                                            duration: '',
                                          },
                                        },
                                      },
                                    }
                                    setSelectedNode(updatedNode)
                                    return updatedNode
                                  }
                                  return n
                                })
                                return updatedNodes
                              })
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить встречу
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'survey' && (
                  <div className="space-y-2">
                    <Label>Компоненты формы</Label>
                    <div className="space-y-2">
                      {selectedNode.data.content.form.components.map((component: FormComponent, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{component.label}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNodes((nodes) =>
                                  nodes.map((n) =>
                                    n.id === selectedNode.id
                                      ? {
                                          ...n,
                                          data: {
                                            ...n.data,
                                            content: {
                                              ...n.data.content,
                                              form: {
                                                ...n.data.content.form,
                                                components: n.data.content.form.components.filter(
                                                  (_: FormComponent, i: number) => i !== index
                                                ),
                                              },
                                            },
                                          },
                                        }
                                      : n
                                  )
                                )
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {component.type === 'textfield' && (
                            <div className="space-y-2">
                              <Input
                                value={component.label}
                                onChange={(e) => {
                                  setNodes((nodes) =>
                                    nodes.map((n) =>
                                      n.id === selectedNode.id
                                        ? {
                                            ...n,
                                            data: {
                                              ...n.data,
                                              content: {
                                                ...n.data.content,
                                                form: {
                                                  ...n.data.content.form,
                                                  components: n.data.content.form.components.map(
                                                    (c: FormComponent, i: number) =>
                                                      i === index ? { ...c, label: e.target.value } : c
                                                  ),
                                                },
                                              },
                                            },
                                          }
                                        : n
                                    )
                                  )
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={component.required}
                                  onChange={(e) => {
                                    setNodes((nodes) =>
                                      nodes.map((n) =>
                                        n.id === selectedNode.id
                                          ? {
                                              ...n,
                                              data: {
                                                ...n.data,
                                                content: {
                                                  ...n.data.content,
                                                  form: {
                                                    ...n.data.content.form,
                                                    components: n.data.content.form.components.map(
                                                      (c: FormComponent, i: number) =>
                                                        i === index ? { ...c, required: e.target.checked } : c
                                                    ),
                                                  },
                                                },
                                              },
                                            }
                                          : n
                                      )
                                    )
                                  }}
                                />
                                <Label>Обязательное поле</Label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          console.log('Adding new field to node:', selectedNode.id)
                          setNodes((nds) => {
                            const updatedNodes = nds.map((n) => {
                              if (n.id === selectedNode.id) {
                                const newField = {
                                  id: `field-${Date.now()}`,
                                  type: 'textfield' as const,
                                  label: 'Новое поле',
                                  required: false,
                                }
                                const updatedNode = {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    content: {
                                      ...n.data.content,
                                      form: {
                                        ...n.data.content.form,
                                        components: [...n.data.content.form.components, newField],
                                      },
                                    },
                                  },
                                }
                                // Обновляем selectedNode
                                setSelectedNode(updatedNode)
                                return updatedNode
                              }
                              return n
                            })
                            console.log('Updated nodes after adding field:', updatedNodes)
                            return updatedNodes
                          })
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить поле
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 