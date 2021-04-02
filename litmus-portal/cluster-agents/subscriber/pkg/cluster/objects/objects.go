package objects

import (
	"encoding/json"
	"errors"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
)

//GetKubernetesObjects is used to get the Kubernetes Object details according to the request type
func GetKubernetesObjects(request types.KubeObjRequest) (string, error) {
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return "", err
	}
	clientset, err := kubernetes.NewForConfig(conf)
	if err != nil {
		return "", err
	}

	resourceType := schema.GroupVersionResource{
		Group:    request.KubeGVRRequest.Group,
		Version:  request.KubeGVRRequest.Version,
		Resource: request.KubeGVRRequest.Resource,
	}
	_, dynamicClient, err := k8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return "", err
	}
	var ObjData []*types.KubeObject
	namespace, err := clientset.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		return "", err
	}

	if len(namespace.Items) > 0 {
		for _, namespace := range namespace.Items {
			podList, err := GetObjectDataByNamespace(namespace.GetName(), dynamicClient, resourceType)
			if err != nil {
				return "", err
			}
			KubeObj := &types.KubeObject{
				Namespace: namespace.GetName(),
				Data:      podList,
			}
			ObjData = append(ObjData, KubeObj)
		}
		kubeData, _ := json.Marshal(ObjData)
		//fmt.Println(string(kubeData))
		//
		//var kubeObjects []*types.KubeObject
		//err := json.Unmarshal(kubeData, &kubeObjects)
		//if err != nil {
		//	return nil, err
		//}
		//return kubeObjects, nil
		return string(kubeData), nil
	} else {
		return "", errors.New("No namespace available")
	}
}

//GetObjectDataByNamespace uses dynamic client to fetch Kubernetes Objects data.
func GetObjectDataByNamespace(namespace string, dynamicClient dynamic.Interface, resourceType schema.GroupVersionResource) ([]unstructured.Unstructured, error) {
	list, err := dynamicClient.Resource(resourceType).Namespace(namespace).List(metav1.ListOptions{})
	var kubeObjects []unstructured.Unstructured
	if err != nil {
		return kubeObjects, nil
	}
	for _, list := range list.Items {
			kubeObjects = append(kubeObjects,list)
	}
	return kubeObjects, nil
}
